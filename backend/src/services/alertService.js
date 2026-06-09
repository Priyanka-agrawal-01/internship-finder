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

function jobMatchesPreferences(job, prefs) {
  const {
    itCompanies    = true,
    eceCompanies   = false,
    companies      = [],
    roles          = [],
    internshipsOnly = true,
  } = prefs;

  // internship filter
  if (internshipsOnly && !job.isInternship) return false;

  // specific company override — if set, only match those companies
  if (companies.length > 0) {
    return companies.some(c => job.company?.toLowerCase().includes(c.toLowerCase()));
  }

  // category filters
  const isECE = ECE_COMPANIES.has(job.company);
  const isIT  = !isECE;

  if (!itCompanies && !eceCompanies) return true; // "All" effectively
  if (itCompanies  && isIT)          {} // pass through
  else if (eceCompanies && isECE)    {} // pass through
  else return false;

  // role keyword filter
  if (roles.length > 0) {
    const haystack = (job.title + ' ' + (job.tags || []).join(' ')).toLowerCase();
    return roles.some(r => haystack.includes(r.toLowerCase()));
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
  console.log(`[AlertService] Notifying ${subscribers.length} active subscribers`);

  let emailsSent = 0;
  let emailsFailed = 0;

  for (const sub of subscribers) {
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
