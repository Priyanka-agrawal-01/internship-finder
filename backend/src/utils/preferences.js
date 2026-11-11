'use strict';
const { ALLOWED_LOCATIONS } = require('../services/jobMatcher');

// Deliberately strict: plain dot-atom local part and an ASCII/punycode domain.
// Rejects quotes, <>, ;, commas, parentheses and spaces — the characters that
// mail address parsers have historically misread into extra or wrong recipients.
const EMAIL_REGEX   = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const MAX_EMAIL_LEN = 254;

const BOOLEAN_KEYS = [
  'itCompanies', 'eceCompanies', 'remoteInternships', 'productCompanies', 'startups',
  'aiMlRoles', 'frontendRoles', 'backendRoles', 'vlsiRoles', 'embeddedRoles',
];
const FREQUENCIES = ['instant', '6hours', 'daily'];

/** Returns a trimmed, lower-cased email, or null if it isn't a valid email string. */
function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_REGEX.test(email)) return null;
  return email;
}

function cleanStringList(value, maxItems = 10, maxLen = 60) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(v => typeof v === 'string')
    .map(v => v.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Turn whatever the client sent into a well-formed preferences object.
 * Never throws — null, arrays, strings, and missing fields all fall back to defaults.
 */
function sanitizePreferences(input) {
  const p = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const out = {};
  for (const key of BOOLEAN_KEYS) out[key] = p[key] === true;
  out.frequency = FREQUENCIES.includes(p.frequency) ? p.frequency : '6hours';
  out.locations = Array.isArray(p.locations)
    ? [...new Set(p.locations.filter(l => ALLOWED_LOCATIONS.includes(l)))]
    : [];
  // Legacy fields
  out.companies       = cleanStringList(p.companies);
  out.roles           = cleanStringList(p.roles);
  out.internshipsOnly = p.internshipsOnly !== false;
  return out;
}

module.exports = { normalizeEmail, sanitizePreferences };
