'use strict';
const express  = require('express');
const crypto   = require('crypto');
const router   = express.Router();
const emailSvc = require('../services/emailService');
const { isDBConnected } = require('../config/db');
const { normalizeEmail, sanitizePreferences } = require('../utils/preferences');
const { escapeHtml, safeUrl } = require('../utils/html');
const { rateLimit, requireAdmin, asyncHandler } = require('../middleware/security');

// In-memory fallback when MongoDB is unavailable
const inMemorySubscribers = new Map(); // email -> { token, prefs, active }

// Lazy model getter — avoids circular require at startup
function getSubscriber() { return require('../models/Subscriber'); }

// Subscribing and requesting unsubscribe links both send email from our
// account, so they're rate limited per IP to stop them being used for spam.
const subscribeLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many subscription attempts. Please try again in a few minutes.' });
const unsubscribeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5,  message: 'Too many unsubscribe requests. Please try again in a few minutes.' });

function sendInBackground(label, promise, email) {
  promise
    .then(result => console.log(`[Subscribe] ${label} sent to ${email} (msgId: ${result?.messageId || 'N/A'})`))
    .catch(err => console.error(`[Subscribe] ${label} failed for ${email}: ${err.message}`));
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/subscribe
//  Creates a subscriber, re-activates one, or updates preferences.
//  The welcome email is sent only for new or re-activated subscribers, so
//  re-submitting the form can't be used to send the same inbox repeated mail.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', subscribeLimiter, asyncHandler(async (req, res) => {
  const body       = req.body && typeof req.body === 'object' ? req.body : {};
  const cleanEmail = normalizeEmail(body.email);

  if (!cleanEmail) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const prefs = sanitizePreferences(body.preferences);

  let unsubscribeToken;
  let outcome; // 'created' | 'reactivated' | 'updated'

  try {
    if (isDBConnected()) {
      const Subscriber = getSubscriber();
      const existing   = await Subscriber.findOne({ email: cleanEmail });

      if (existing) {
        outcome              = existing.active ? 'updated' : 'reactivated';
        existing.active      = true;
        existing.preferences = prefs;
        await existing.save();
        unsubscribeToken = existing.unsubscribeToken;
      } else {
        const sub = await Subscriber.create({ email: cleanEmail, preferences: prefs });
        unsubscribeToken = sub.unsubscribeToken;
        outcome = 'created';
      }
    } else {
      console.warn('[Subscribe] MongoDB unavailable — using in-memory fallback');
      const existing = inMemorySubscribers.get(cleanEmail);
      if (existing) {
        outcome = existing.active ? 'updated' : 'reactivated';
        existing.prefs  = prefs;
        existing.active = true;
        unsubscribeToken = existing.token;
      } else {
        unsubscribeToken = crypto.randomBytes(32).toString('hex');
        inMemorySubscribers.set(cleanEmail, { token: unsubscribeToken, prefs, active: true });
        outcome = 'created';
      }
    }
  } catch (dbErr) {
    if (dbErr.code === 11000) {
      // Two requests raced to create the same subscriber — treat as an update
      return res.status(200).json({ success: true, message: 'Your preferences have been updated.' });
    }
    console.error('[Subscribe] DB error:', dbErr.message);
    return res.status(500).json({
      success: false,
      message: 'Subscription failed due to a database error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? dbErr.message : undefined,
    });
  }

  console.log(`[Subscribe] ${outcome}: ${cleanEmail}`);

  if (outcome !== 'updated') {
    sendInBackground('Welcome email', emailSvc.sendWelcomeEmail(cleanEmail, prefs, unsubscribeToken), cleanEmail);
  }

  return res.status(200).json({
    success: true,
    message: outcome === 'updated'
      ? 'Your preferences have been updated.'
      : 'Successfully subscribed! Check your inbox for a welcome email.',
  });
}));

// ─────────────────────────────────────────────────────────────────────────────
//  Unsubscribe by token (the link in every email)
// ─────────────────────────────────────────────────────────────────────────────
function readToken(value) {
  return typeof value === 'string' && /^[a-f0-9]{16,128}$/i.test(value) ? value : null;
}

/** Returns true if a subscriber with this token was found and deactivated. */
async function unsubscribeByToken(token) {
  if (isDBConnected()) {
    const sub = await getSubscriber().findOneAndUpdate(
      { unsubscribeToken: token, active: true },
      { $set: { active: false } },
      { new: true }
    );
    if (sub) console.log(`[Subscribe] Unsubscribed: ${sub.email}`);
    return !!sub;
  }
  for (const [email, data] of inMemorySubscribers) {
    if (data.token === token && data.active) {
      data.active = false;
      console.log(`[Subscribe] Unsubscribed (memory): ${email}`);
      return true;
    }
  }
  return false;
}

// GET /api/subscribe/unsubscribe?token=xxx  — the link a person clicks
router.get('/unsubscribe', asyncHandler(async (req, res) => {
  const token = readToken(req.query.token);
  if (!token) {
    return res.status(400).send(buildPage('Invalid Link', 'This unsubscribe link is missing or malformed.', false));
  }

  try {
    const done = await unsubscribeByToken(token);
    if (!done) {
      return res.send(buildPage('Already Removed', "This unsubscribe link has already been used or doesn't match an active subscription.", true));
    }
    return res.send(buildPage('Unsubscribed ✓', "You've been successfully unsubscribed. You won't receive any more alerts.", true));
  } catch (err) {
    console.error('[Unsubscribe] Error:', err.message);
    return res.status(500).send(buildPage('Error', 'Something went wrong. Please try again.', false));
  }
}));

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/subscribe/unsubscribe
//  • With ?token=…  → RFC 8058 one-click unsubscribe (what Gmail's
//    "Unsubscribe" button sends because of our List-Unsubscribe-Post header).
//  • With { email } → emails that address a confirmation link. Typing an
//    address is never enough on its own to unsubscribe someone, and the
//    response is the same whether or not the address is subscribed.
// ─────────────────────────────────────────────────────────────────────────────
// One-click requests come from mail providers' shared servers, so only the
// email-typed branch is rate limited.
const limitUnlessToken = (req, res, next) =>
  readToken(req.query.token) ? next() : unsubscribeLimiter(req, res, next);

router.post('/unsubscribe', limitUnlessToken, asyncHandler(async (req, res) => {
  const token = readToken(req.query.token);
  if (token) {
    await unsubscribeByToken(token);
    return res.status(200).json({ success: true, message: 'You have been unsubscribed.' });
  }

  const body       = req.body && typeof req.body === 'object' ? req.body : {};
  const cleanEmail = normalizeEmail(body.email);
  if (!cleanEmail) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  let tokenToSend = null;
  try {
    if (isDBConnected()) {
      const sub = await getSubscriber().findOne({ email: cleanEmail, active: true }, { unsubscribeToken: 1 }).lean();
      tokenToSend = sub?.unsubscribeToken || null;
    } else {
      const mem = inMemorySubscribers.get(cleanEmail);
      tokenToSend = mem?.active ? mem.token : null;
    }
  } catch (err) {
    console.error('[Unsubscribe API] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }

  if (tokenToSend) {
    sendInBackground('Unsubscribe link', emailSvc.sendUnsubscribeLinkEmail(cleanEmail, tokenToSend), cleanEmail);
  }

  return res.status(200).json({
    success: true,
    message: "If that address is subscribed, we've emailed it a link to confirm unsubscribing.",
  });
}));

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/subscribe/status?email=...  (admin/debug — needs x-admin-token)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status', requireAdmin, asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.query.email);
  if (!email) return res.status(400).json({ success: false, message: 'A valid email is required.' });

  if (!isDBConnected()) {
    const mem = inMemorySubscribers.get(email);
    return res.json({ success: true, subscribed: !!mem?.active, source: 'memory' });
  }
  const sub = await getSubscriber().findOne(
    { email },
    { active: 1, preferences: 1, alertCount: 1, lastAlertSentAt: 1 }
  ).lean();
  return res.json({ success: true, subscribed: !!sub?.active, data: sub });
}));

// ─────────────────────────────────────────────────────────────────────────────
//  HTML unsubscribe page
// ─────────────────────────────────────────────────────────────────────────────
function buildPage(title, message, success) {
  const icon  = success ? '✅' : '❌';
  const color = success ? '#16A34A' : '#DC2626';
  const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(title)} — InternPulse</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'IBM Plex Sans','Segoe UI',Arial,sans-serif;background:#F7F9F8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
    .card{background:#fff;border:1px solid #D5E1DF;border-radius:16px;max-width:440px;width:100%;padding:40px 32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
    .icon{font-size:48px;margin-bottom:16px}
    h1{font-size:22px;font-weight:800;color:#06525C;margin-bottom:12px}
    p{color:#2F737D;font-size:15px;line-height:1.6;margin-bottom:24px}
    a.btn{display:inline-block;background:#06525C;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700}
    .brand{margin-top:24px;font-size:13px;color:#5E8D93}
    .brand strong{color:#06525C}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1 style="color:${color}">${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <a class="btn" href="${safeUrl(FRONTEND)}">Back to InternPulse</a>
    <div class="brand"><strong>Intern</strong>Pulse — Real-time Internship Alerts</div>
  </div>
</body>
</html>`;
}

module.exports = router;
