'use strict';
const express  = require('express');
const mongoose = require('mongoose');
const router   = express.Router();
const { requireAdminUser } = require('../middleware/auth');
const { rateLimit, asyncHandler } = require('../middleware/security');
const stats    = require('../services/adminStats');
const { getJobs, getCacheStatus, forceRefresh } = require('../services/jobService');
const emailSvc = require('../services/emailService');

const models = () => ({
  User:       require('../models/User'),
  Session:    require('../models/Session'),
  Subscriber: require('../models/Subscriber'),
  SavedItem:  require('../models/SavedItem'),
  AlertRun:   require('../models/AlertRun'),
});

router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600, message: 'Too many admin requests. Please wait a few minutes.' }));
router.use(requireAdminUser);

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const searchTerm = q => (typeof q === 'string' && q.trim() ? new RegExp(escapeRegex(q.trim().slice(0, 100)), 'i') : null);
const paging = req => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
  return { limit, page, skip: (page - 1) * limit };
};
const isId = id => mongoose.isValidObjectId(id);

// ── Overview and traffic ─────────────────────────────────────────────────────
router.get('/overview', asyncHandler(async (req, res) => {
  const cache = getCacheStatus();
  res.json({ success: true, ...(await stats.overview()), jobs: { count: cache.jobCount, internships: cache.internshipCount, lastFetchTime: cache.lastFetchTime } });
}));

router.get('/traffic', asyncHandler(async (req, res) => {
  const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
  res.json({ success: true, ...(await stats.traffic(days)) });
}));

// ── Accounts ─────────────────────────────────────────────────────────────────
function userFilter(req) {
  const re = searchTerm(req.query.q);
  return re ? { $or: [{ email: re }, { name: re }] } : {};
}

router.get('/users', asyncHandler(async (req, res) => {
  const { User, SavedItem } = models();
  const { limit, page, skip } = paging(req);
  const filter = userFilter(req);
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    // passwordHash is read only to say whether the account has a password; it is never sent
    User.find(filter, { failedLogins: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);
  const counts = await SavedItem.aggregate([
    { $match: { user: { $in: users.map(u => u._id) } } },
    { $group: { _id: '$user', bookmarked: { $sum: { $cond: ['$bookmarked', 1, 0] } }, applied: { $sum: { $cond: ['$applied', 1, 0] } } } },
  ]);
  const byUser = new Map(counts.map(c => [String(c._id), c]));
  res.json({
    success: true, total, page, limit,
    items: users.map(u => ({
      id: String(u._id), email: u.email, name: u.name || '', role: u.role || 'user',
      method: u.googleId && u.passwordHash ? 'Email + Google' : u.googleId ? 'Google' : 'Email',
      createdAt: u.createdAt, lastLoginAt: u.lastLoginAt,
      locked: !!(u.lockedUntil && new Date(u.lockedUntil) > new Date()),
      bookmarked: byUser.get(String(u._id))?.bookmarked || 0,
      applied: byUser.get(String(u._id))?.applied || 0,
    })),
  });
}));

// DELETE /api/admin/users/:id: removes an account, its sessions and saved items (not an admin)
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const { User, Session, SavedItem } = models();
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Unknown account.' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'That account no longer exists.' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Admin accounts can only be changed with npm run create-admin.' });
  await SavedItem.deleteMany({ user: user._id });
  await Session.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });
  console.log(`[Admin] ${req.user.email} deleted the account ${user.email}`);
  res.json({ success: true });
}));

// POST /api/admin/users/:id/unlock: clears a lock from too many wrong passwords
router.post('/users/:id/unlock', asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'Unknown account.' });
  await models().User.updateOne({ _id: req.params.id }, { $set: { failedLogins: 0, lockedUntil: null } });
  res.json({ success: true });
}));

// ── Alert subscribers ────────────────────────────────────────────────────────
function subscriberFilter(req) {
  const filter = {};
  if (req.query.status === 'active') filter.active = true;
  if (req.query.status === 'inactive') filter.active = false;
  const re = searchTerm(req.query.q);
  if (re) filter.email = re;
  return filter;
}

const PREF_LABELS = {
  itCompanies: 'IT', eceCompanies: 'ECE', remoteInternships: 'Remote', productCompanies: 'Product', startups: 'Startups',
  aiMlRoles: 'AI/ML', frontendRoles: 'Frontend', backendRoles: 'Backend', vlsiRoles: 'VLSI', embeddedRoles: 'Embedded',
};
const prefSummary = p => [
  ...Object.entries(PREF_LABELS).filter(([k]) => p?.[k]).map(([, l]) => l),
  ...(p?.locations || []),
];

router.get('/subscribers', asyncHandler(async (req, res) => {
  const { Subscriber } = models();
  const { limit, page, skip } = paging(req);
  const filter = subscriberFilter(req);
  const [total, subs] = await Promise.all([
    Subscriber.countDocuments(filter),
    Subscriber.find(filter, { unsubscribeToken: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);
  res.json({
    success: true, total, page, limit,
    items: subs.map(s => ({
      id: String(s._id), email: s.email, active: s.active, frequency: s.preferences?.frequency || '6hours',
      interests: prefSummary(s.preferences), createdAt: s.createdAt, lastAlertSentAt: s.lastAlertSentAt, alertCount: s.alertCount || 0,
    })),
  });
}));

// PATCH /api/admin/subscribers/:id  { active }: pause or resume someone's alerts
router.patch('/subscribers/:id', asyncHandler(async (req, res) => {
  if (!isId(req.params.id) || typeof req.body?.active !== 'boolean') return res.status(400).json({ success: false, message: 'Invalid request.' });
  const sub = await models().Subscriber.findByIdAndUpdate(req.params.id, { $set: { active: req.body.active } }, { new: true, projection: { email: 1, active: 1 } });
  if (!sub) return res.status(404).json({ success: false, message: 'That subscriber no longer exists.' });
  console.log(`[Admin] ${req.user.email} ${sub.active ? 'resumed' : 'paused'} alerts for ${sub.email}`);
  res.json({ success: true, active: sub.active });
}));

// ── CSV downloads ────────────────────────────────────────────────────────────
router.get('/export/:what', asyncHandler(async (req, res) => {
  const { User, Subscriber } = models();
  let csv;
  if (req.params.what === 'users') {
    const users = await User.find({}, { email: 1, name: 1, role: 1, googleId: 1, createdAt: 1, lastLoginAt: 1 }).sort({ createdAt: -1 }).lean();
    csv = stats.toCsv(['email', 'name', 'role', 'sign_in', 'created_at', 'last_login_at'],
      users.map(u => [u.email, u.name, u.role || 'user', u.googleId ? 'google' : 'email', u.createdAt, u.lastLoginAt]));
  } else if (req.params.what === 'subscribers') {
    const subs = await Subscriber.find({}, { unsubscribeToken: 0 }).sort({ createdAt: -1 }).lean();
    csv = stats.toCsv(['email', 'active', 'frequency', 'interests', 'created_at', 'last_alert_at', 'alerts_sent'],
      subs.map(s => [s.email, s.active, s.preferences?.frequency, prefSummary(s.preferences).join(' / '), s.createdAt, s.lastAlertSentAt, s.alertCount || 0]));
  } else {
    return res.status(404).json({ success: false, message: 'Unknown export.' });
  }
  console.log(`[Admin] ${req.user.email} exported ${req.params.what}`);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="internpulse-${req.params.what}-${stats.istDay(new Date())}.csv"`,
    'Cache-Control': 'no-store',
  });
  res.send('﻿' + csv);   // BOM so Excel reads the file as UTF-8
}));

// ── Saved items, job feed, alerts, email ─────────────────────────────────────
router.get('/saved', asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await stats.topSaved(10)) });
}));

router.get('/jobs', asyncHandler(async (req, res) => {
  const jobs = await getJobs();
  res.json({ success: true, cache: getCacheStatus(), ...stats.feedBreakdown(jobs) });
}));

const refreshLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 2, message: 'The feed was just refreshed. Try again in a few minutes.' });
router.post('/jobs/refresh', refreshLimiter, asyncHandler(async (req, res) => {
  const jobs = await forceRefresh();
  console.log(`[Admin] ${req.user.email} refreshed the job feed (${jobs.length} jobs)`);
  res.json({ success: true, count: jobs.length, cache: getCacheStatus() });
}));

router.get('/alerts', asyncHandler(async (req, res) => {
  const runs = await models().AlertRun.find().sort({ startedAt: -1 }).limit(72).lean();
  res.json({ success: true, schedule: process.env.ALERT_CRON || '0 * * * *', runs });
}));

const testMailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'You can send 5 test emails an hour.' });
router.post('/email/test', testMailLimiter, asyncHandler(async (req, res) => {
  try {
    const r = await emailSvc.sendTestEmail(req.user.email);
    res.json({ success: true, to: req.user.email, previewUrl: r.previewUrl || null, testInbox: r.testInbox });
  } catch (err) {
    console.error('[Admin] Test email failed:', err.message);
    res.status(502).json({ success: false, message: `The mail server refused it: ${err.message}` });
  }
}));

module.exports = router;
