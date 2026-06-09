'use strict';
const express  = require('express');
const router   = express.Router();
const emailSvc = require('../services/emailService');
const { isDBConnected } = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory fallback when MongoDB is unavailable
const inMemorySubscribers = new Map();

// Lazy model getter — avoids circular require at startup
function getSubscriber() { return require('../models/Subscriber'); }

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/subscribe
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  console.log('[Subscribe] POST /api/subscribe — route entered');

  // ── 1. Validate input ──────────────────────────────────────────────────────
  const { email, preferences = {} } = req.body || {};

  if (!email || typeof email !== 'string') {
    console.log('[Subscribe] Rejected — missing email');
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    console.log('[Subscribe] Rejected — invalid email format:', email);
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  console.log(`[Subscribe] Processing subscription for: ${cleanEmail}`);

  // ── 2. Sanitise preferences ────────────────────────────────────────────────
  const prefs = {
    itCompanies:     preferences.itCompanies    !== false,
    eceCompanies:    preferences.eceCompanies   === true,
    internshipsOnly: preferences.internshipsOnly !== false,
    companies:       Array.isArray(preferences.companies) ? preferences.companies.slice(0, 10) : [],
    roles:           Array.isArray(preferences.roles)     ? preferences.roles.slice(0, 10)     : [],
  };

  // ── 3. Persist subscriber ──────────────────────────────────────────────────
  let unsubscribeToken;
  let isNew = true;

  try {
    if (isDBConnected()) {
      console.log('[Subscribe] Saving to MongoDB...');
      const Subscriber = getSubscriber();
      const existing   = await Subscriber.findOne({ email: cleanEmail });

      if (existing) {
        // Re-activate or update preferences
        existing.active      = true;
        existing.preferences = prefs;
        await existing.save();
        unsubscribeToken = existing.unsubscribeToken;
        isNew = false;
        console.log(`[Subscribe] Updated existing subscriber: ${cleanEmail}`);
      } else {
        const sub = await Subscriber.create({ email: cleanEmail, preferences: prefs });
        unsubscribeToken = sub.unsubscribeToken;
        console.log(`[Subscribe] New subscriber created: ${cleanEmail}`);
      }
    } else {
      // In-memory fallback
      console.warn('[Subscribe] MongoDB unavailable — using in-memory fallback');
      if (inMemorySubscribers.has(cleanEmail)) {
        unsubscribeToken = inMemorySubscribers.get(cleanEmail).token;
        isNew = false;
        console.log(`[Subscribe] Updated in-memory subscriber: ${cleanEmail}`);
      } else {
        unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
        inMemorySubscribers.set(cleanEmail, { token: unsubscribeToken, prefs });
        console.log(`[Subscribe] New in-memory subscriber: ${cleanEmail}`);
      }
    }
  } catch (dbErr) {
    // Handle MongoDB duplicate key gracefully
    if (dbErr.code === 11000) {
      console.log(`[Subscribe] Duplicate key — already subscribed: ${cleanEmail}`);
      // Fetch the existing token so we can still send the welcome email
      try {
        const Subscriber = getSubscriber();
        const sub = await Subscriber.findOne({ email: cleanEmail });
        if (sub) {
          unsubscribeToken = sub.unsubscribeToken;
          isNew = false;
        }
      } catch (_) { /* ignore */ }

      if (!unsubscribeToken) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed! Your preferences have been kept.',
        });
      }
    } else {
      console.error('[Subscribe] DB error:', dbErr.message);
      return res.status(500).json({
        success: false,
        message: 'Subscription failed due to a database error. Please try again.',
        error: process.env.NODE_ENV === 'development' ? dbErr.message : undefined,
      });
    }
  }

  // ── 4. Send welcome email (non-blocking on failure) ────────────────────────
  let previewUrl = null;
  try {
    console.log('[Subscribe] Sending welcome email...');
    const result = await emailSvc.sendWelcomeEmail(cleanEmail, prefs, unsubscribeToken);
    previewUrl   = result?.previewUrl || null;
    console.log(`[Subscribe] Welcome email sent successfully to ${cleanEmail}`);
  } catch (emailErr) {
    // Log the error but DO NOT let it prevent the success response
    console.error(`[Subscribe] Welcome email failed for ${cleanEmail}: ${emailErr.message}`);
    // Continue to return success — subscription WAS saved
  }

  // ── 5. Always return a response ────────────────────────────────────────────
  console.log(`[Subscribe] Sending 200 response to ${cleanEmail}`);
  return res.status(200).json({
    success: true,
    message: isNew
      ? 'Successfully subscribed! Check your inbox for a welcome email.'
      : 'Your preferences have been updated.',
    previewUrl,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/subscribe/unsubscribe?token=xxx
// ─────────────────────────────────────────────────────────────────────────────
router.get('/unsubscribe', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(buildPage('Invalid Link', 'No unsubscribe token was provided.', false));
  }

  try {
    if (isDBConnected()) {
      const Subscriber = getSubscriber();
      const sub = await Subscriber.findOneAndUpdate(
        { unsubscribeToken: token },
        { $set: { active: false } },
        { new: true }
      );
      if (!sub) {
        return res.send(buildPage('Already Removed', "This unsubscribe link has already been used or doesn't exist.", true));
      }
      console.log(`[Subscribe] Unsubscribed: ${sub.email}`);
    } else {
      let found = false;
      for (const [email, data] of inMemorySubscribers) {
        if (data.token === token) { inMemorySubscribers.delete(email); found = true; break; }
      }
      if (!found) {
        return res.send(buildPage('Not Found', "This link doesn't match any active subscription.", false));
      }
    }
    return res.send(buildPage('Unsubscribed ✓', "You've been successfully unsubscribed. You won't receive any more alerts.", true));
  } catch (err) {
    console.error('[Unsubscribe] Error:', err.message);
    return res.status(500).send(buildPage('Error', 'Something went wrong. Please try again.', false));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/subscribe/status?email=...  (debug)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });

  if (!isDBConnected()) {
    const mem = inMemorySubscribers.get(email.toLowerCase());
    return res.json({ success: true, subscribed: !!mem, source: 'memory' });
  }
  try {
    const Subscriber = getSubscriber();
    const sub = await Subscriber.findOne(
      { email: email.toLowerCase() },
      { active: 1, preferences: 1, alertCount: 1, lastAlertSentAt: 1 }
    ).lean();
    return res.json({ success: true, subscribed: !!sub?.active, data: sub });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  HTML unsubscribe page
// ─────────────────────────────────────────────────────────────────────────────
function buildPage(title, message, success) {
  const icon  = success ? '✅' : '❌';
  const color = success ? '#16A34A' : '#DC2626';
  const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} — InternPulse</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#F8FAFC;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
    .card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;max-width:440px;width:100%;padding:40px 32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
    .icon{font-size:48px;margin-bottom:16px}
    h1{font-size:22px;font-weight:800;color:#0F172A;margin-bottom:12px}
    p{color:#64748B;font-size:15px;line-height:1.6;margin-bottom:24px}
    a.btn{display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700}
    .brand{margin-top:24px;font-size:13px;color:#94A3B8}
    .brand strong{color:#2563EB}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1 style="color:${color}">${title}</h1>
    <p>${message}</p>
    <a class="btn" href="${FRONTEND}">Back to InternPulse</a>
    <div class="brand"><strong>Intern</strong>Pulse — Real-time Internship Alerts</div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/subscribe/unsubscribe
// ─────────────────────────────────────────────────────────────────────────────
router.post('/unsubscribe', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    if (isDBConnected()) {
      const Subscriber = getSubscriber();
      const sub = await Subscriber.findOneAndUpdate(
        { email: cleanEmail },
        { $set: { active: false } },
        { new: true }
      );
      if (!sub) {
        return res.status(404).json({ success: false, message: 'No active subscription found for this email.' });
      }
      console.log(`[Subscribe API] Unsubscribed: ${cleanEmail}`);
    } else {
      if (!inMemorySubscribers.has(cleanEmail)) {
        return res.status(404).json({ success: false, message: 'No active subscription found for this email.' });
      }
      inMemorySubscribers.delete(cleanEmail);
      console.log(`[Subscribe API] Unsubscribed (memory): ${cleanEmail}`);
    }
    return res.status(200).json({ success: true, message: 'Successfully unsubscribed from all alerts.' });
  } catch (err) {
    console.error('[Unsubscribe API] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Unsubscription failed due to a database error.' });
  }
});

module.exports = router;

