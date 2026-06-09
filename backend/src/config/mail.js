'use strict';
const nodemailer = require('nodemailer');

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSPORTER SINGLETON  — created once, never recreated
// ─────────────────────────────────────────────────────────────────────────────
let _transporter       = null;
let _isTestAccount     = false;
let _initPromise       = null;          // prevents concurrent initialisation
let _initDone          = false;

// Maximum ms to wait for Ethereal account creation before giving up
const ETHEREAL_TIMEOUT_MS = 5000;

/**
 * Promisified setTimeout helper
 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Race an async operation against a timeout.
 * Resolves with the result or rejects with a TimeoutError.
 */
function withTimeout(promise, ms, label = 'Operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeout,
  ]);
}

/**
 * Build a guaranteed-working dummy transporter that logs to console.
 * Used when SMTP credentials are missing AND Ethereal can't be reached.
 */
function buildDummyTransporter() {
  console.warn('[Mail] Using DUMMY transporter — emails will be logged to console only.');
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

/**
 * Initialise the transporter exactly once.
 * Priority:
 *   1. Real SMTP via SMTP_HOST/PORT/USER/PASS
 *   2. Gmail shorthand via EMAIL_USER/EMAIL_PASS (legacy support)
 *   3. Ethereal test account (with 5s timeout)
 *   4. Console dummy (never hangs)
 */
async function initTransporter() {
  // ── Option 1: Real SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) ───────
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`[Mail] Configuring SMTP → ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`);
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 8000,
      greetingTimeout:   5000,
      socketTimeout:     8000,
    });
    return;
  }

  // ── Option 2: Gmail shorthand (EMAIL_USER, EMAIL_PASS) ────────────────────
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`[Mail] Configuring Gmail SMTP for ${process.env.EMAIL_USER}`);
    _transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 8000,
      socketTimeout:     8000,
    });
    return;
  }

  // ── Option 3: Ethereal test account (with hard timeout) ───────────────────
  console.log('[Mail] No SMTP credentials found — attempting Ethereal test account...');
  try {
    const testAccount = await withTimeout(
      nodemailer.createTestAccount(),
      ETHEREAL_TIMEOUT_MS,
      'Ethereal account creation'
    );

    _isTestAccount = true;
    _transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: 8000,
      socketTimeout:     8000,
    });

    console.log('\n════════════════════════════════════════════════════════');
    console.log('  📧 Ethereal Test Account Ready');
    console.log(`  User: ${testAccount.user}`);
    console.log(`  Pass: ${testAccount.pass}`);
    console.log('  View sent emails → https://ethereal.email/login');
    console.log('════════════════════════════════════════════════════════\n');
    return;
  } catch (err) {
    console.warn(`[Mail] Ethereal failed (${err.message}) — falling back to dummy transporter.`);
  }

  // ── Option 4: Dummy transporter — NEVER HANGS ─────────────────────────────
  _transporter = buildDummyTransporter();
}

/**
 * Returns the initialised transporter.
 * Safe to call concurrently — only initialises once.
 */
async function getTransporter() {
  if (_initDone) {
    return { transporter: _transporter, isTestAccount: _isTestAccount };
  }

  // Only run initTransporter once even if called concurrently
  if (!_initPromise) {
    _initPromise = initTransporter()
      .then(() => { _initDone = true; })
      .catch(err => {
        console.error('[Mail] init failed, using dummy:', err.message);
        _transporter = buildDummyTransporter();
        _initDone = true;
      });
  }

  await _initPromise;
  return { transporter: _transporter, isTestAccount: _isTestAccount };
}

// Kick off initialisation immediately at startup (non-blocking)
getTransporter().catch(() => {});

module.exports = { getTransporter };
