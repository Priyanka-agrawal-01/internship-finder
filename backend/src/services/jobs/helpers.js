'use strict';
/**
 * What every job source shares: the normalised job shape, place and internship
 * detection, and a polite request helper.
 */
const crypto = require('node:crypto');

const FETCH_TIMEOUT_MS = 15000;
const NEW_BADGE_HOURS  = 24;
const UA = 'InternPulse-Aggregator/2.0 (internship and job feed for students in India)';

// ── Places ────────────────────────────────────────────────────────────────────
// Indian states and the cities employers list most, so "Noida, Uttar Pradesh",
// "Bengaluru, KA" and "Remote - India" all count as India.
const INDIA_RE = new RegExp([
  'india', 'bharat',
  'bengaluru', 'bangalore', 'hyderabad', 'secunderabad', 'pune', 'mumbai', 'navi mumbai', 'thane',
  'gurugram', 'gurgaon', 'noida', 'greater noida', 'new delhi', 'delhi', 'faridabad', 'ghaziabad',
  'chennai', 'kolkata', 'ahmedabad', 'gandhinagar', 'jaipur', 'kochi', 'cochin', 'coimbatore',
  'thiruvananthapuram', 'trivandrum', 'indore', 'bhopal', 'chandigarh', 'mohali', 'panchkula',
  'lucknow', 'nagpur', 'vadodara', 'surat', 'mysuru', 'mysore', 'mangaluru', 'mangalore',
  'visakhapatnam', 'vizag', 'vijayawada', 'bhubaneswar', 'guwahati', 'patna', 'ranchi', 'dehradun',
  'karnataka', 'maharashtra', 'telangana', 'tamil nadu', 'haryana', 'uttar pradesh', 'west bengal',
  'gujarat', 'rajasthan', 'kerala', 'andhra pradesh', 'madhya pradesh', 'punjab', 'odisha',
].map(s => `\\b${s}\\b`).join('|'), 'i');

const isIndia = (...parts) => INDIA_RE.test(parts.filter(Boolean).join(' '));

function detectCountry(location = '') {
  const loc = location.toLowerCase();
  if (INDIA_RE.test(loc)) return 'India';
  if (/remote|worldwide|anywhere|global/.test(loc)) return 'Remote';
  if (/united states|usa|\bus\b|new york|san francisco|seattle|austin/.test(loc)) return 'United States';
  if (/germany|berlin|munich|hamburg/.test(loc)) return 'Germany';
  if (/united kingdom|london|manchester/.test(loc)) return 'United Kingdom';
  if (/canada|toronto|vancouver/.test(loc)) return 'Canada';
  if (/singapore/.test(loc)) return 'Singapore';
  if (/australia|sydney|melbourne/.test(loc)) return 'Australia';
  if (/netherlands|amsterdam/.test(loc)) return 'Netherlands';
  if (/france|paris/.test(loc)) return 'France';
  return 'Worldwide';
}

function detectWorkMode(location = '', isRemoteFlag = false) {
  if (isRemoteFlag) return 'Remote';
  const loc = location.toLowerCase();
  if (/hybrid/.test(loc)) return 'Hybrid';
  if (/remote/.test(loc)) return 'Remote';
  return 'On-site';
}

// ── Internships ───────────────────────────────────────────────────────────────
// Matched as whole words so "International", "Internal" and "Internet" don't
// count as internships. Includes the German, Dutch and French terms the European
// boards use, and the Indian ones ("fresher", "GET" programmes, "campus").
const INTERN_KW = [
  'intern', 'interns', 'internship', 'internships', 'co-op', 'coop', 'placement',
  'student', 'students', 'working student', 'werkstudent', 'werkstudentin', 'werkstudent:in',
  'praktikum', 'praktikant', 'praktikantin', 'stagiaire', 'alternance', 'stage',
  'apprentice', 'apprenticeship', 'trainee', 'traineeship', 'fellowship', 'graduate program',
  'graduate programme', 'fresher', 'freshers', 'entry level', 'entry-level', 'campus', 'summer program',
  'graduate engineer trainee', 'new grad', 'new graduate',
];
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const INTERN_RE = new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${INTERN_KW.map(escapeRe).join('|')})(?=$|[^\\p{L}\\p{N}])`, 'iu');

function checkIsInternship(title = '', tags = [], type = '') {
  return INTERN_RE.test(`${title} ${tags.join(' ')} ${type}`);
}

// ── Pay ───────────────────────────────────────────────────────────────────────
/** An annual salary range as a monthly estimate ("₹40,000–60,000/mo"), or null. */
function parseStipend(salaryMin, salaryMax, currency = 'USD') {
  if (!salaryMin && !salaryMax) return null;
  const min = Number(salaryMin) || 0;
  const max = Number(salaryMax) || min * 1.3;
  const monthMin = Math.round(min / 12);
  const monthMax = Math.round(max / 12);
  if (monthMin <= 0) return null;
  if (currency === 'INR' || currency === '₹') return `₹${monthMin.toLocaleString('en-IN')}–${monthMax.toLocaleString('en-IN')}/mo`;
  return `$${monthMin.toLocaleString()}–$${monthMax.toLocaleString()}/mo`;
}

// ── Shape ─────────────────────────────────────────────────────────────────────
function isPostedRecently(postedAt) {
  if (!postedAt) return false;
  return Date.now() - new Date(postedAt).getTime() < NEW_BADGE_HOURS * 3600000;
}

/** A date as an ISO string, or `fallback` when it is missing or unreadable. */
function isoDate(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const d = new Date(typeof value === 'number' && value < 1e12 ? value * 1000 : value);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', hellip: '…' };
/** Decodes the HTML entities job APIs leave in titles ("R&amp;D", "&#8211;"). React escapes the result again. */
const decodeEntities = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') {
    const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
  }
  return ENTITIES[e.toLowerCase()] ?? m;
});
/** Plain text from an HTML fragment: tags removed, entities decoded, spaces collapsed. */
const stripHtml = (s = '') => decodeEntities(String(s).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Stable short id for sources that don't always give one. */
function stableId(...parts) {
  return crypto.createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 16);
}

// Tags without blanks or repeats (a board's team and department are often the same word)
const uniqueTags = list => [...new Set((Array.isArray(list) ? list : []).map(t => String(t || '').trim()).filter(Boolean))];

/** The normalised job every source produces. */
function base(extra) {
  return {
    stipend:  null,
    duration: null,
    logoUrl:  null,   // only set when the source API provides a real logo
    workMode: 'On-site',
    ...extra,
    tags:   uniqueTags(extra.tags),
    skills: uniqueTags(extra.skills || extra.tags),
    isNew: isPostedRecently(extra.postedAt),
  };
}

// ── Requests ──────────────────────────────────────────────────────────────────
const reasonOf = err => (err?.response ? `HTTP ${err.response.status}` : (err?.code || err?.message || 'unknown error'));

/**
 * Runs requests and logs every failure with its reason, so a source that silently
 * returns 0 jobs is visible in the logs. Returns the successful results; throws
 * when every request failed, so the feed knows the source is down (and keeps its
 * earlier listings) rather than taking "no jobs" for an answer.
 */
async function settleRequests(label, requests) {
  const results = await Promise.allSettled(requests);
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length) {
    const reasons = [...new Set(failures.map(f => reasonOf(f.reason)))];
    console.warn(`[${label}] ${failures.length}/${results.length} requests failed (${reasons.join(', ')})`);
    if (failures.length === results.length) throw new Error(`every request failed (${reasons.join(', ')})`);
  }
  return results.filter(r => r.status === 'fulfilled').map(r => r.value);
}

/** Runs `fn` over `items` with at most `limit` at a time; returns settled results in order. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      try { out[i] = { status: 'fulfilled', value: await fn(items[i], i) }; }
      catch (reason) { out[i] = { status: 'rejected', reason }; }
    }
  }));
  return out;
}

module.exports = {
  FETCH_TIMEOUT_MS, UA, INDIA_RE,
  isIndia, detectCountry, detectWorkMode, checkIsInternship, parseStipend,
  isPostedRecently, isoDate, stripHtml, stableId, base, settleRequests, mapLimit, reasonOf,
};
