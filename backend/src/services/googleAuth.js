'use strict';
const { OAuth2Client } = require('google-auth-library');

let client = null;

/** The OAuth client ids this server accepts (GOOGLE_CLIENT_ID, comma-separated). */
const clientIds = () => (process.env.GOOGLE_CLIENT_ID || '').split(',').map(s => s.trim()).filter(Boolean);

const isGoogleConfigured = () => clientIds().length > 0;

/**
 * Checks a Google Identity Services credential (an ID token): Google's signature,
 * that it was issued for our client id, that it hasn't expired, and that Google
 * has verified the email. Returns { googleId, email, name } or throws an error
 * with a `status` of 401 (bad token) or 503 (not configured).
 */
async function verifyGoogleCredential(credential) {
  if (!isGoogleConfigured()) {
    throw Object.assign(new Error('Google sign-in is not set up on this server.'), { status: 503 });
  }
  if (typeof credential !== 'string' || credential.length > 4096) {
    throw Object.assign(new Error('Missing Google credential.'), { status: 401 });
  }
  client ||= new OAuth2Client();
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientIds() });
    payload = ticket.getPayload();
  } catch {
    throw Object.assign(new Error('Google sign-in could not be verified. Please try again.'), { status: 401 });
  }
  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw Object.assign(new Error('Your Google account has no verified email address.'), { status: 401 });
  }
  return { googleId: payload.sub, email: payload.email.toLowerCase(), name: payload.name || '' };
}

module.exports = { verifyGoogleCredential, isGoogleConfigured };
