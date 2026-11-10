'use strict';
const crypto = require('node:crypto');
const { isDBConnected } = require('../config/db');

const SESSION_DAYS = 30;
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;   // 32 random bytes, base64url

const newToken  = () => crypto.randomBytes(32).toString('base64url');
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

// Lazy so the server still boots (and its tests run) without the models loaded
const models = () => ({ User: require('../models/User'), Session: require('../models/Session') });

/** Starts a session for `user` and returns the token the browser keeps. */
async function createSession(user) {
  const token = newToken();
  await models().Session.create({
    tokenHash: hashToken(token),
    user:      user._id,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000),
  });
  return token;
}

/** Reads "Authorization: Bearer <token>"; returns the token or null. */
function readBearer(req) {
  const m = /^Bearer (\S+)$/.exec(req.get('authorization') || '');
  return m && TOKEN_RE.test(m[1]) ? m[1] : null;
}

/** Accounts live in MongoDB: without it, say so instead of failing oddly. */
function requireDB(req, res, next) {
  if (isDBConnected()) return next();
  return res.status(503).json({ success: false, message: 'Accounts are unavailable right now. Please try again in a few minutes.' });
}

/** Lets the request through only with a live session; sets req.user and req.sessionId. */
function requireAuth(req, res, next) {
  requireDB(req, res, async () => {
    try {
      const token = readBearer(req);
      if (!token) return res.status(401).json({ success: false, message: 'Please sign in.' });
      const { Session, User } = models();
      const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
      const user = session && await User.findById(session.user);
      if (!user) return res.status(401).json({ success: false, message: 'Your session has ended. Please sign in again.' });
      req.user = user;
      req.sessionId = session._id;
      next();
    } catch (err) {
      next(err);
    }
  });
}

/** requireAuth, and the account must be an admin (made with `npm run create-admin`). */
function requireAdminUser(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role === 'admin') return next();
    return res.status(403).json({ success: false, message: 'This page is for the site admin.' });
  });
}

module.exports = { createSession, requireAuth, requireAdminUser, requireDB, readBearer, hashToken, newToken, SESSION_DAYS };
