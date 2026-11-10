'use strict';

/**
 * Visit tracking, kept small and anonymous: no IP address, no name or email, no cookie.
 * The browser sends a random visitor id (localStorage) and a session id (sessionStorage);
 * the server adds device, browser and OS from the User-Agent and drops bots.
 */

const PAGES = ['landing', 'jobs', 'companies', 'resources', 'blog', 'about', 'alerts', 'myjobs', 'admin'];
const ID_RE = /^[A-Za-z0-9-]{8,64}$/;

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|prerender|facebookexternalhit|whatsapp|telegram|discord|slack|embedly|python|curl|wget|node-fetch|axios|go-http|java\/|okhttp|httpclient|phantom|puppeteer|playwright|selenium/i;

const isBot = ua => !ua || BOT_RE.test(ua);

/** { device, browser, os } from a User-Agent string; coarse on purpose. */
function parseUserAgent(ua = '') {
  const device = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua) ? 'Tablet'
    : /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua) ? 'Mobile' : 'Desktop';
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
    : /Firefox\/|FxiOS/.test(ua) ? 'Firefox'
    : /Chrome\/|CriOS/.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari' : 'Other';
  const os = /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
    : /CrOS/.test(ua) ? 'ChromeOS'
    : /Linux/.test(ua) ? 'Linux' : 'Other';
  return { device, browser, os };
}

/** The host of an http(s) URL, without "www.", or ''. */
function hostOf(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.hostname.replace(/^www\./, '').toLowerCase().slice(0, 100) : '';
  } catch {
    return '';
  }
}

const LOCAL_HOST_RE = /^(localhost|127\.0\.0\.1|\[::1\]|.*\.localhost)$/;
const isLocalHost = host => LOCAL_HOST_RE.test(host || '');

/**
 * Turns the browser's report into a Visit document, or null when it should not be
 * counted (malformed, a bot, or a page served from this machine while developing).
 *   body: { v: visitorId, s: sessionId, n: isNewVisitor, p: page, r: referrer, u: utm_source }
 *   ctx:  { userAgent, origin, recordLocal }
 */
function buildVisit(body, { userAgent = '', origin = '', recordLocal = false } = {}) {
  if (!body || typeof body !== 'object') return null;
  if (isBot(userAgent)) return null;
  const siteHost = hostOf(origin);
  if (isLocalHost(siteHost) && !recordLocal) return null;

  const visitorId = typeof body.v === 'string' && ID_RE.test(body.v) ? body.v : null;
  const sessionId = typeof body.s === 'string' && ID_RE.test(body.s) ? body.s : null;
  const page = PAGES.includes(body.p) ? body.p : null;
  if (!visitorId || !sessionId || !page) return null;

  let referrer = hostOf(body.r);
  if (referrer && (referrer === siteHost || isLocalHost(referrer))) referrer = '';   // moving around the site itself
  const utmSource = typeof body.u === 'string' ? body.u.replace(/[^\w.-]/g, '').slice(0, 40).toLowerCase() : '';

  return {
    at: new Date(),
    visitorId, sessionId, page,
    newVisitor: body.n === true,
    referrer, utmSource,
    ...parseUserAgent(userAgent),
  };
}

module.exports = { buildVisit, parseUserAgent, isBot, hostOf, isLocalHost, PAGES };
