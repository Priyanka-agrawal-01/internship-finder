'use strict';
const crypto = require('crypto');

/**
 * Small in-memory, fixed-window rate limiter keyed by client IP.
 * Good enough for a single server instance; use a shared store (e.g. Redis)
 * if the API is ever scaled to several instances.
 */
function rateLimit({ windowMs, max, message = 'Too many requests. Please try again later.' }) {
  const hits = new Map(); // ip -> { count, resetAt }

  // Periodically drop expired entries so the map can't grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
  }, windowMs).unref();

  return (req, res, next) => {
    const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(ip, entry);
    }
    entry.count++;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}

/**
 * Protects admin/debug endpoints. Requires the ADMIN_TOKEN env var to be set
 * and sent by the caller in the `x-admin-token` header. If ADMIN_TOKEN is not
 * configured, the endpoint is disabled entirely.
 */
function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(404).json({ success: false, message: 'Not found.' });
  }
  const given = req.get('x-admin-token') || '';
  const a = Buffer.from(String(given));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  next();
}

/**
 * Wraps an async route handler so a thrown error or rejected promise is passed
 * to Express's error handler instead of becoming an unhandled rejection
 * (which crashes the Node process).
 */
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { rateLimit, requireAdmin, asyncHandler };
