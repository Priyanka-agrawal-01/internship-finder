'use strict';
const cron        = require('node-cron');
const { getJobs } = require('./jobService');
const emailSvc    = require('./emailService');
const { jobMatchesPreferences } = require('./jobMatcher');
const { isDBConnected } = require('../config/db');

// Lazy-require models so the app still boots when DB is absent
const getModels = () => {
  const Subscriber   = require('../models/Subscriber');
  const JobSnapshot  = require('../models/JobSnapshot');
  return { Subscriber, JobSnapshot };
};

// Minimum hours between two alert emails for each frequency setting.
// The cron runs hourly, so 'instant' means "within the hour".
const FREQUENCY_MIN_HOURS = {
  instant: 0,
  '6hours': 5.5,   // a little slack so cron timing jitter doesn't skip a whole cycle
  daily:    23,
};
const MAX_LOOKBACK_MS     = 7 * 24 * 3600 * 1000;  // never alert about jobs first seen more than a week ago
const MAX_JOBS_PER_EMAIL  = 5;

function isDue(sub, now) {
  const minHours = FREQUENCY_MIN_HOURS[sub.preferences?.frequency] ?? FREQUENCY_MIN_HOURS['6hours'];
  if (!sub.lastAlertSentAt) return true;
  const hoursSince = (now - new Date(sub.lastAlertSentAt).getTime()) / 3600000;
  return hoursSince >= minHours;
}

/** The cycle's key: its UTC hour, e.g. "2026-11-10T19". */
const cycleKey = date => date.toISOString().slice(0, 13);

/**
 * Claim this hour's cycle for this server. Returns false when another server
 * that shares the database (a local dev server and the deployed one, say)
 * already claimed it, so subscribers never get the same alert twice.
 */
async function claimCycle(date) {
  const AlertRun = require('../models/AlertRun');
  try {
    await AlertRun.create({ _id: cycleKey(date), host: require('os').hostname() });
    return true;
  } catch (err) {
    if (err.code === 11000) return false;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN ALERT CYCLE
//  1. Fetch current jobs and record any we haven't seen before (JobSnapshot)
//  2. For each subscriber whose frequency says they're due, collect jobs first
//     seen since their last alert (or since they subscribed) that match their
//     preferences, and email up to MAX_JOBS_PER_EMAIL of them.
//
//  Because matching is based on "first seen since your last alert", a daily
//  subscriber still gets jobs that appeared during cycles they were skipped.
// ─────────────────────────────────────────────────────────────────────────────
async function runAlertCycle() {
  console.log(`\n[AlertService] ─── Alert cycle started at ${new Date().toISOString()} ───`);

  if (!isDBConnected()) {
    console.warn('[AlertService] MongoDB not connected — skipping alert cycle.');
    return;
  }

  const startedAt = new Date();
  if (!(await claimCycle(startedAt))) {
    console.log('[AlertService] Another server sharing this database already ran this hour\'s cycle — skipping.');
    return;
  }

  // what this cycle did, kept on its AlertRun for the admin panel
  const stats = { jobs: 0, newJobs: 0, subscribers: 0, due: 0, sent: 0, failed: 0, error: '' };
  try {
    await alertCycleBody(stats);
  } catch (err) {
    stats.error = err.message;
    throw err;
  } finally {
    await require('../models/AlertRun')
      .updateOne({ _id: cycleKey(startedAt) }, { $set: { ...stats, finishedAt: new Date() } })
      .catch(err => console.error('[AlertService] Could not record the cycle:', err.message));
  }
}

async function alertCycleBody(stats) {
  const { Subscriber, JobSnapshot } = getModels();

  // 1. Fetch all current live jobs
  let freshJobs;
  try {
    freshJobs = await getJobs();
    stats.jobs = freshJobs.length;
    console.log(`[AlertService] Fetched ${freshJobs.length} current jobs`);
  } catch (err) {
    console.error('[AlertService] Job fetch failed:', err.message);
    stats.error = `Job fetch failed: ${err.message}`;
    return;
  }

  // 2. Record jobs we have never seen before
  const ids = freshJobs.map(j => j.id).filter(Boolean);
  const known = new Set(
    (await JobSnapshot.find({ jobId: { $in: ids } }, { jobId: 1, _id: 0 }).lean()).map(s => s.jobId)
  );
  const newJobs = freshJobs.filter(j => j.id && !known.has(j.id));
  stats.newJobs = newJobs.length;
  console.log(`[AlertService] ${newJobs.length} new jobs detected (${freshJobs.length - newJobs.length} already known)`);

  if (newJobs.length > 0) {
    const firstSeenAt = new Date();
    const snapshotDocs = newJobs.map(j => ({
      jobId:        j.id,
      title:        j.title,
      company:      j.company,
      location:     j.location || '',
      country:      j.country || '',
      workMode:     j.workMode || '',
      isRemote:     j.isRemote === true,
      url:          j.url,
      source:       j.source,
      stipend:      j.stipend || null,
      tags:         j.tags || [],
      isInternship: j.isInternship === true,
      postedAt:     j.postedAt ? new Date(j.postedAt) : null,
      firstSeenAt,
    }));
    try {
      await JobSnapshot.insertMany(snapshotDocs, { ordered: false }); // ordered:false = skip dups gracefully
      console.log(`[AlertService] Stored ${snapshotDocs.length} new job snapshots`);
    } catch (err) {
      const inserted = snapshotDocs.length - (err.writeErrors?.length ?? 0);
      console.log(`[AlertService] Stored ~${inserted} snapshots (some may have been duplicates)`);
    }
  }

  // 3. Work out which subscribers are due an email this cycle
  const now = Date.now();
  const subscribers = await Subscriber.find({ active: true }).lean();
  const due = subscribers.filter(sub => isDue(sub, now));
  stats.subscribers = subscribers.length;
  stats.due = due.length;
  console.log(`[AlertService] ${due.length} of ${subscribers.length} active subscribers are due this cycle`);
  if (due.length === 0) return;

  // 4. Load every job first seen in the look-back window, newest first
  const floor  = now - MAX_LOOKBACK_MS;
  const recent = await JobSnapshot.find({ firstSeenAt: { $gt: new Date(floor) } })
    .sort({ firstSeenAt: -1 })
    .lean();

  let emailsSent = 0;
  let emailsFailed = 0;

  for (const sub of due) {
    const since = Math.max(
      new Date(sub.lastAlertSentAt || sub.createdAt || 0).getTime(),
      floor
    );
    const matching = recent.filter(j =>
      new Date(j.firstSeenAt).getTime() > since && jobMatchesPreferences(j, sub.preferences || {})
    );
    if (matching.length === 0) continue;

    const toSend = matching.slice(0, MAX_JOBS_PER_EMAIL).map(j => ({ ...j, id: j.jobId }));

    try {
      await emailSvc.sendJobAlertEmail(sub.email, toSend, sub.unsubscribeToken);
      await Subscriber.updateOne(
        { _id: sub._id },
        { $set: { lastAlertSentAt: new Date() }, $inc: { alertCount: 1 } }
      );
      emailsSent++;
      stats.sent++;
      console.log(`[AlertService] ✉ Alert sent to ${sub.email} (${toSend.length} jobs)`);
    } catch (err) {
      emailsFailed++;
      stats.failed++;
      console.error(`[AlertService] ✗ Failed to email ${sub.email}:`, err.message);
    }
  }

  console.log(`[AlertService] ─── Cycle complete: ${emailsSent} sent, ${emailsFailed} failed ───\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  CRON SCHEDULER  — runs hourly by default ("0 * * * *").
//  Each subscriber's own frequency (instant / 6hours / daily) decides whether
//  they actually get an email in a given cycle.
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_ALERT_CRON = '0 * * * *';

function startAlertScheduler() {
  const schedule = process.env.ALERT_CRON || DEFAULT_ALERT_CRON;

  cron.schedule(schedule, async () => {
    try {
      await runAlertCycle();
    } catch (err) {
      console.error('[AlertService] Unhandled error in alert cycle:', err.message);
    }
  });

  console.log(`[AlertService] Scheduler started — running on cron: "${schedule}"`);
  return schedule;
}

module.exports = { startAlertScheduler, runAlertCycle, isDue, cycleKey, DEFAULT_ALERT_CRON };
