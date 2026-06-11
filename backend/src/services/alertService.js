'use strict';
const cron        = require('node-cron');
const { getJobs } = require('./jobService');
const emailSvc    = require('./emailService');
const { isDBConnected } = require('../config/db');

// Lazy-require models so the app still boots when DB is absent
const getModels = () => {
  const Subscriber   = require('../models/Subscriber');
  const JobSnapshot  = require('../models/JobSnapshot');
  return { Subscriber, JobSnapshot };
};

// ─────────────────────────────────────────────────────────────────────────────
//  PREFERENCE MATCHING
//  Returns true if the job satisfies the subscriber's preferences.
// ─────────────────────────────────────────────────────────────────────────────

// Known ECE companies (mirrors companiesData.js categories)
const ECE_COMPANIES = new Set([
  'Qualcomm','Intel','AMD','Cadence','Synopsys','Broadcom',
  'Texas Instruments','Marvell','MediaTek','Nokia','Ericsson',
  'Samsung Semiconductors','Micron Technology','NXP Semiconductors',
  'STMicroelectronics','Infineon Technologies','Renesas','Keysight Technologies',
  'National Instruments','Analog Devices','Lam Research','Applied Materials',
  'ASML','NVIDIA','ARM Holdings','Bosch','Siemens','Honeywell','Rockwell Automation',
  'ABB','Emerson','Schneider Electric','GE Digital','L&T Technology Services',
  'Tata Elxsi','KPIT Technologies','Continental','Harman','Visteon','Aptiv',
  'Mphasis','Zensar Technologies','Cyient','LTTS',
]);

// Helper to check if a string contains any of the keywords
function containsKeywords(text, keywords) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function jobMatchesPreferences(job, prefs) {
  const {
    itCompanies       = false,
    eceCompanies      = false,
    remoteInternships = false,
    productCompanies  = false,
    startups          = false,
    aiMlRoles         = false,
    frontendRoles     = false,
    backendRoles      = false,
    vlsiRoles         = false,
    embeddedRoles     = false,
    locations         = [],
    internshipsOnly   = true,
  } = prefs;

  // 1. Internship filter
  if (internshipsOnly && !job.isInternship) return false;

  // 2. IT / ECE Company filter
  const isECE = ECE_COMPANIES.has(job.company);
  const isIT  = !isECE;

  // If either IT or ECE is selected, we enforce it. If both are selected or both are false, it doesn't filter out by company type.
  if ((itCompanies || eceCompanies) && !(itCompanies && eceCompanies)) {
    if (itCompanies && !isIT) return false;
    if (eceCompanies && !isECE) return false;
  }

  // 3. Remote Internships filter
  if (remoteInternships) {
    const isRemote = job.workMode === 'Remote' || job.isRemote || containsKeywords(job.location || '', ['remote']);
    if (!isRemote) return false;
  }

  // 4. Product Companies filter
  if (productCompanies) {
    const PRODUCT_COMPANIES = new Set([
      'Google', 'Microsoft', 'Amazon', 'Adobe', 'Flipkart', 'Cisco', 'NVIDIA', 'Atlassian', 'PayPal', 
      'Samsung', 'Oracle', 'Salesforce', 'Intuit', 'ServiceNow', 'VMware', 'Walmart', 'Uber', 'LinkedIn', 'DE Shaw'
    ]);
    if (!PRODUCT_COMPANIES.has(job.company)) return false;
  }

  // 5. Startups filter
  if (startups) {
    const STARTUPS = new Set(['Razorpay', 'Zomato', 'Swiggy', 'Paytm', 'Meesho', 'PhonePe', 'Cred', 'Groww']);
    const isStartupSource = containsKeywords(job.source || '', ['remotive', 'wellfound']);
    if (!STARTUPS.has(job.company) && !isStartupSource) return false;
  }

  // 6. Role filters
  const anyRoleChecked = aiMlRoles || frontendRoles || backendRoles || vlsiRoles || embeddedRoles;
  if (anyRoleChecked) {
    const titleAndTags = (job.title + ' ' + (job.tags || []).join(' ')).toLowerCase();
    let matched = false;

    if (aiMlRoles && containsKeywords(titleAndTags, ['ai', 'ml', 'machine learning', 'deep learning', 'nlp', 'data science', 'computer vision', 'artificial intelligence'])) {
      matched = true;
    }
    if (frontendRoles && containsKeywords(titleAndTags, ['frontend', 'front-end', 'react', 'vue', 'angular', 'html', 'css', 'ui', 'ux', 'web dev', 'web developer'])) {
      matched = true;
    }
    if (backendRoles && containsKeywords(titleAndTags, ['backend', 'back-end', 'node', 'express', 'django', 'spring', 'springboot', 'flask', 'golang', 'java', 'c#', 'sql', 'python', 'apis', 'rest'])) {
      matched = true;
    }
    if (vlsiRoles && containsKeywords(titleAndTags, ['vlsi', 'rtl', 'verilog', 'systemverilog', 'asic', 'fpga', 'synthesis', 'uvm', 'verification', 'ic design', 'analog design', 'digital design'])) {
      matched = true;
    }
    if (embeddedRoles && containsKeywords(titleAndTags, ['embedded', 'firmware', 'microcontroller', 'mcu', 'iot', 'rtos', 'arduino', 'raspberry pi', 'stm32', 'device driver'])) {
      matched = true;
    }

    if (!matched) return false;
  }

  // 7. Location filters
  if (locations && locations.length > 0) {
    const jobCountry = (job.country || '').toLowerCase();
    const jobLoc = (job.location || '').toLowerCase();
    
    const matchesLocation = locations.some(loc => {
      if (loc === 'India') return jobCountry === 'india' || jobLoc.includes('india');
      if (loc === 'Remote') return job.workMode === 'Remote' || job.isRemote || jobLoc.includes('remote');
      if (loc === 'United States') return jobCountry === 'united states' || jobLoc.includes('united states') || jobLoc.includes(' us') || jobLoc.includes('usa');
      if (loc === 'Europe') {
        const europeanCountries = ['germany', 'united kingdom', 'uk', 'france', 'netherlands', 'poland', 'ireland', 'sweden', 'switzerland', 'spain', 'italy'];
        return europeanCountries.includes(jobCountry) || europeanCountries.some(c => jobLoc.includes(c));
      }
      if (loc === 'Other Countries') {
        const isIndia = jobCountry === 'india' || jobLoc.includes('india');
        const isUS = jobCountry === 'united states' || jobLoc.includes('united states') || jobLoc.includes(' us') || jobLoc.includes('usa');
        const europeanCountries = ['germany', 'united kingdom', 'uk', 'france', 'netherlands', 'poland', 'ireland', 'sweden', 'switzerland', 'spain', 'italy'];
        const isEurope = europeanCountries.includes(jobCountry) || europeanCountries.some(c => jobLoc.includes(c));
        return !isIndia && !isUS && !isEurope;
      }
      return false;
    });

    if (!matchesLocation) return false;
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN ALERT CYCLE
//  1. Fetch fresh jobs from all sources
//  2. Diff against JobSnapshot collection → find truly new jobs
//  3. Insert new jobs into snapshot
//  4. For each subscriber, find matching new jobs and send email
// ─────────────────────────────────────────────────────────────────────────────
async function runAlertCycle() {
  console.log(`\n[AlertService] ─── Alert cycle started at ${new Date().toISOString()} ───`);

  if (!isDBConnected()) {
    console.warn('[AlertService] MongoDB not connected — skipping alert cycle.');
    return;
  }

  const { Subscriber, JobSnapshot } = getModels();

  // 1. Fetch all current live jobs
  let freshJobs;
  try {
    freshJobs = await getJobs();
    console.log(`[AlertService] Fetched ${freshJobs.length} fresh jobs`);
  } catch (err) {
    console.error('[AlertService] Job fetch failed:', err.message);
    return;
  }

  // 2. Find which jobs are genuinely new (not yet in snapshot)
  const existingIds = new Set(
    (await JobSnapshot.find({}, { jobId: 1, _id: 0 }).lean()).map(s => s.jobId)
  );

  const newJobs = freshJobs.filter(j => j.id && !existingIds.has(j.id));
  console.log(`[AlertService] ${newJobs.length} new jobs detected (${freshJobs.length - newJobs.length} already known)`);

  if (newJobs.length === 0) {
    console.log('[AlertService] No new openings — no emails sent.');
    return;
  }

  // 3. Persist new jobs to snapshot
  const snapshotDocs = newJobs.map(j => ({
    jobId:       j.id,
    title:       j.title,
    company:     j.company,
    location:    j.location,
    url:         j.url,
    source:      j.source,
    stipend:     j.stipend || null,
    tags:        j.tags || [],
    isInternship: j.isInternship,
    firstSeenAt: new Date(),
    alertSent:   false,
  }));

  try {
    await JobSnapshot.insertMany(snapshotDocs, { ordered: false }); // ordered:false = skip dups gracefully
    console.log(`[AlertService] Stored ${snapshotDocs.length} new job snapshots`);
  } catch (err) {
    // E11000 bulk duplicate errors are fine — just log count
    const inserted = snapshotDocs.length - (err.writeErrors?.length ?? 0);
    console.log(`[AlertService] Stored ~${inserted} snapshots (some may have been duplicates)`);
  }

  // 4. Find all active subscribers and send matching alerts
  const subscribers = await Subscriber.find({ active: true }).lean();
  
  const toAlert = subscribers.filter(sub => {
    const freq = sub.preferences?.frequency || '6hours';
    if (freq === 'daily') {
      if (sub.lastAlertSentAt) {
        const hoursSince = (Date.now() - new Date(sub.lastAlertSentAt).getTime()) / 3600000;
        if (hoursSince < 22) {
          console.log(`[AlertService] Skipping daily subscriber ${sub.email} (last sent ${hoursSince.toFixed(1)}h ago)`);
          return false;
        }
      }
    }
    return true;
  });

  console.log(`[AlertService] Notifying ${toAlert.length} active subscribers (out of ${subscribers.length} total active)`);

  let emailsSent = 0;
  let emailsFailed = 0;

  for (const sub of toAlert) {
    const matching = newJobs.filter(j => jobMatchesPreferences(j, sub.preferences || {}));
    if (matching.length === 0) continue;

    // Cap at 5 jobs per email to keep it focused
    const toSend = matching.slice(0, 5);

    try {
      await emailSvc.sendJobAlertEmail(sub.email, toSend, sub.unsubscribeToken);
      await Subscriber.updateOne(
        { _id: sub._id },
        { $set: { lastAlertSentAt: new Date() }, $inc: { alertCount: 1 } }
      );
      emailsSent++;
      console.log(`[AlertService] ✉ Alert sent to ${sub.email} (${toSend.length} jobs)`);
    } catch (err) {
      emailsFailed++;
      console.error(`[AlertService] ✗ Failed to email ${sub.email}:`, err.message);
    }
  }

  // 5. Mark snapshots as alerted
  await JobSnapshot.updateMany(
    { jobId: { $in: newJobs.map(j => j.id) } },
    { $set: { alertSent: true } }
  ).catch(() => {}); // non-critical

  console.log(`[AlertService] ─── Cycle complete: ${emailsSent} sent, ${emailsFailed} failed ───\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  CRON SCHEDULER  — runs every 6 hours
//  Cron: "0 */6 * * *"  → at 00:00, 06:00, 12:00, 18:00 daily
// ─────────────────────────────────────────────────────────────────────────────
function startAlertScheduler() {
  const schedule = process.env.ALERT_CRON || '0 */6 * * *';

  cron.schedule(schedule, async () => {
    try {
      await runAlertCycle();
    } catch (err) {
      console.error('[AlertService] Unhandled error in alert cycle:', err.message);
    }
  });

  console.log(`[AlertService] Scheduler started — running on cron: "${schedule}"`);
}

module.exports = { startAlertScheduler, runAlertCycle };
