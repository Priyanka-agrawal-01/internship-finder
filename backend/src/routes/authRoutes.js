'use strict';
const express = require('express');
const router  = express.Router();
const { normalizeEmail } = require('../utils/preferences');
const { hashPassword, verifyPassword, passwordProblem, DUMMY_HASH } = require('../utils/passwords');
const { createSession, requireAuth, requireDB, hashToken, readBearer } = require('../middleware/auth');
const { verifyGoogleCredential, isGoogleConfigured } = require('../services/googleAuth');
const { rateLimit, asyncHandler } = require('../middleware/security');

const models = () => ({
  User:      require('../models/User'),
  Session:   require('../models/Session'),
  SavedItem: require('../models/SavedItem'),
});

// Sign-up and sign-in are where passwords get guessed: 20 tries per 15 minutes per IP
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many sign-in attempts. Please try again in a few minutes.' });

const body = req => (req.body && typeof req.body === 'object' ? req.body : {});
const cleanName = v => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 60) : '');

// The IP limit above stops one machine guessing; this stops many machines guessing one
// account: after MAX_FAILED wrong passwords in a row the account waits LOCK_MINUTES.
const MAX_FAILED = 10;
const LOCK_MINUTES = 15;
async function recordFailedLogin(User, id) {
  const u = await User.findOneAndUpdate({ _id: id }, { $inc: { failedLogins: 1 } }, { new: true, projection: { failedLogins: 1, email: 1 } });
  if (u && u.failedLogins >= MAX_FAILED) {
    await User.updateOne({ _id: id }, { $set: { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) } });
    console.warn(`[Auth] ${u.email} locked for ${LOCK_MINUTES} minutes after ${MAX_FAILED} wrong passwords`);
  }
}

async function signedIn(res, user, status = 200, extra = {}) {
  user.lastLoginAt = new Date();
  await user.save();
  const token = await createSession(user);
  return res.status(status).json({ success: true, user: user.toPublic(), token, ...extra });
}

// GET /api/auth/config: what the sign-in dialog should offer. The Google client id is
// public (it is in every page that shows a Google button), so the browser reads it
// here and GOOGLE_CLIENT_ID only has to be set on the server.
router.get('/config', (req, res) => {
  const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').split(',')[0].trim();
  res.json({ success: true, google: isGoogleConfigured(), googleClientId: googleClientId || null });
});

// POST /api/auth/register  { name?, email, password }
router.post('/register', authLimiter, requireDB, asyncHandler(async (req, res) => {
  const { name, email: rawEmail, password } = body(req);
  const email = normalizeEmail(rawEmail);
  if (!email) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  const problem = passwordProblem(password);
  if (problem) return res.status(400).json({ success: false, message: problem });

  const { User } = models();
  const existing = await User.findOne({ email }, { passwordHash: 1, googleId: 1 }).lean();
  if (existing) {
    return res.status(409).json({
      success: false,
      message: existing.passwordHash
        ? 'An account with this email already exists. Sign in instead.'
        : 'This email already has an account that uses Google. Use Continue with Google.',
    });
  }

  let user;
  try {
    user = await User.create({ email, name: cleanName(name), passwordHash: await hashPassword(password) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'An account with this email already exists. Sign in instead.' });
    throw err;
  }
  console.log(`[Auth] Account created: ${email}`);
  return signedIn(res, user, 201);
}));

// POST /api/auth/login  { email, password }
router.post('/login', authLimiter, requireDB, asyncHandler(async (req, res) => {
  const { email: rawEmail, password } = body(req);
  const email = normalizeEmail(rawEmail);
  if (!email || typeof password !== 'string' || !password || password.length > 1024) {
    return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
  }
  const { User } = models();
  const user = await User.findOne({ email });
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({ success: false, message: `Too many wrong passwords for this account. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` });
  }
  // always run one hash check, so a missing account answers as slowly as a wrong password
  const matches = await verifyPassword(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !user.passwordHash || !matches) {
    if (user?.passwordHash) await recordFailedLogin(User, user._id);
    return res.status(401).json({
      success: false,
      message: 'Email or password is incorrect. If you signed up with Google, use Continue with Google.',
    });
  }
  user.failedLogins = 0;
  user.lockedUntil = null;
  return signedIn(res, user);
}));

// POST /api/auth/google  { credential }  (the ID token from Google Identity Services)
router.post('/google', authLimiter, requireDB, asyncHandler(async (req, res) => {
  let profile;
  try {
    profile = await verifyGoogleCredential(body(req).credential);
  } catch (err) {
    return res.status(err.status || 401).json({ success: false, message: err.message });
  }

  const { User, Session } = models();
  let user = await User.findOne({ googleId: profile.googleId });
  let passwordRemoved = false;

  if (!user) {
    user = await User.findOne({ email: profile.email });
    if (user?.googleId && user.googleId !== profile.googleId) {
      return res.status(409).json({ success: false, message: 'This email is linked to a different Google account.' });
    }
    if (user) {
      // An email sign-up never proved it owns the address, so its password may have
      // been set by someone else who typed this email first. Google has now proved
      // ownership: link the account, drop that password and end its sessions.
      if (!user.emailVerified && user.passwordHash) {
        user.passwordHash = '';
        passwordRemoved = true;
        await Session.deleteMany({ user: user._id });
      }
      user.googleId = profile.googleId;
      user.emailVerified = true;
      if (!user.name) user.name = cleanName(profile.name);
    } else {
      user = new User({ email: profile.email, name: cleanName(profile.name), googleId: profile.googleId, emailVerified: true });
      console.log(`[Auth] Account created with Google: ${profile.email}`);
    }
  }
  return signedIn(res, user, 200, passwordRemoved
    ? { notice: 'This account is now linked to Google. Its password was removed because the email had not been verified, so sign in with Google from now on.' }
    : {});
}));

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user.toPublic() });
});

// POST /api/auth/logout  (ends this browser's session only)
router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  await models().Session.deleteOne({ tokenHash: hashToken(readBearer(req)) });
  res.json({ success: true });
}));

// DELETE /api/auth/me  (deletes the account, every session and every saved item)
router.delete('/me', requireAuth, asyncHandler(async (req, res) => {
  const { User, Session, SavedItem } = models();
  const id = req.user._id;
  await SavedItem.deleteMany({ user: id });
  await Session.deleteMany({ user: id });
  await User.deleteOne({ _id: id });
  console.log(`[Auth] Account deleted: ${req.user.email}`);
  res.json({ success: true });
}));

module.exports = router;
