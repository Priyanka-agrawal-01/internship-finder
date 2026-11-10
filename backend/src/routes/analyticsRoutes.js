'use strict';
const express = require('express');
const router  = express.Router();
const { isDBConnected } = require('../config/db');
const { buildVisit } = require('../utils/analytics');
const { rateLimit, asyncHandler } = require('../middleware/security');

// A page view is a handful of bytes; 60 a minute per IP is far above any real visitor
const visitLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: 'Too many requests.' });

// POST /api/analytics/visit
// The browser sends it as text/plain (a "simple" request: no CORS preflight, and it
// survives the page closing with keepalive), so it is parsed here, not by express.json.
router.post('/visit', visitLimiter, express.text({ type: '*/*', limit: '2kb' }), asyncHandler(async (req, res) => {
  res.status(204).end();   // answer at once; the browser never waits on analytics
  if (!isDBConnected()) return;
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return; }
  }
  const visit = buildVisit(body, {
    userAgent:   req.get('user-agent') || '',
    origin:      req.get('origin') || req.get('referer') || '',
    recordLocal: process.env.ANALYTICS_RECORD_LOCAL === 'true',
  });
  if (!visit) return;
  try {
    await require('../models/Visit').create(visit);
  } catch (err) {
    console.error('[Analytics] Could not store a visit:', err.message);
  }
}));

module.exports = router;
