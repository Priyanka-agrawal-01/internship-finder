'use strict';
const crypto        = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);

// scrypt with N=2^14, r=8, p=1: about 16 MB and a few tens of milliseconds per hash.
// The parameters are stored with each hash, so they can be raised later without
// breaking existing passwords.
const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;
const MAX_MEM = 64 * 1024 * 1024;

const MIN_LEN = 8;
const MAX_LEN = 128;

/** Returns why a password can't be used, or null when it's fine. */
function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < MIN_LEN) return `Use at least ${MIN_LEN} characters for your password.`;
  if (password.length > MAX_LEN) return `Use at most ${MAX_LEN} characters for your password.`;
  if (!password.trim()) return 'Your password cannot be only spaces.';
  return null;
}

// NFKC so the same password typed on two keyboards (composed vs decomposed accents) matches
const prepare = password => String(password).normalize('NFKC');

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key  = await scrypt(prepare(password), salt, KEY_LEN, { ...PARAMS, maxmem: MAX_MEM });
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), key.toString('base64')].join('$');
}

/** True when `password` matches `stored` (a hashPassword() result). Never throws. */
async function verifyPassword(password, stored) {
  const parts = typeof stored === 'string' ? stored.split('$') : [];
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every(Number.isInteger)) return false;
  try {
    const expected = Buffer.from(parts[5], 'base64');
    const key = await scrypt(prepare(password), Buffer.from(parts[4], 'base64'), expected.length, { N, r, p, maxmem: MAX_MEM });
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

// Checked against when an email has no password, so a wrong email takes as long to
// answer as a wrong password and response times don't reveal which accounts exist.
const DUMMY_HASH = ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p,
  crypto.randomBytes(16).toString('base64'), crypto.randomBytes(KEY_LEN).toString('base64')].join('$');

module.exports = { hashPassword, verifyPassword, passwordProblem, DUMMY_HASH, MIN_LEN, MAX_LEN };
