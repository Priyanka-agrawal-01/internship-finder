'use strict';
const axios  = require('axios');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_DURATION_MS = 30 * 60 * 1000;   // 30 min
const EMPTY_RETRY_MS    = 2 * 60 * 1000;    // retry sooner when every source came back empty
const JOB_MAX_AGE_DAYS  = 60;
const NEW_BADGE_HOURS   = 24;
const FETCH_TIMEOUT_MS  = 12000;
const UA = 'InternPulse-Aggregator/2.0 (https://internpulse.dev)';

// ─────────────────────────────────────────────────────────────────────────────
//  IN-MEMORY CACHE
// ─────────────────────────────────────────────────────────────────────────────
let jobsCache         = null;
let lastFetchTime     = null;
let lastSourceCounts  = null;
let inFlight          = null;   // the one fetch currently running, shared by all callers

// ─────────────────────────────────────────────────────────────────────────────
//  LOCATION / WORK-MODE HELPERS  (worldwide — no country lock)
// ─────────────────────────────────────────────────────────────────────────────
function detectCountry(location = '') {
  const loc = location.toLowerCase();
  if (/india|bangalore|bengaluru|hyderabad|noida|chennai|mumbai|pune|gurgaon|gurugram|delhi|kolkata|ahmedabad|jaipur|kochi|coimbatore/.test(loc)) return 'India';
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

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNSHIP DETECTION
// ─────────────────────────────────────────────────────────────────────────────
const INTERN_KW = [
  'intern', 'internship', 'co-op', 'coop', 'placement', 'student',
  'apprentice', 'trainee', 'fellowship', 'graduate program', 'fresher',
  'entry level', 'entry-level', 'campus', 'summer program',
];
function checkIsInternship(title = '', tags = [], type = '') {
  const hay = (title + ' ' + tags.join(' ') + ' ' + type).toLowerCase();
  return INTERN_KW.some(k => hay.includes(k));
}

// ─────────────────────────────────────────────────────────────────────────────
//  STIPEND PARSER  — annual salary → monthly estimate string
// ─────────────────────────────────────────────────────────────────────────────
function parseStipend(salaryMin, salaryMax, currency = 'USD') {
  if (!salaryMin && !salaryMax) return null;
  const min = Number(salaryMin) || 0;
  const max = Number(salaryMax) || min * 1.3;
  const monthMin = Math.round(min / 12);
  const monthMax = Math.round(max / 12);
  if (currency === 'INR' || currency === '₹') {
    return monthMin > 0
      ? `₹${monthMin.toLocaleString('en-IN')}–${monthMax.toLocaleString('en-IN')}/mo`
      : null;
  }
  return monthMin > 0
    ? `$${monthMin.toLocaleString()}–$${monthMax.toLocaleString()}/mo`
    : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  FRESHNESS
// ─────────────────────────────────────────────────────────────────────────────
function isExpired(postedAt) {
  if (!postedAt) return false;
  return Date.now() - new Date(postedAt).getTime() > JOB_MAX_AGE_DAYS * 86400000;
}
function isPostedRecently(postedAt) {
  if (!postedAt) return false;
  return Date.now() - new Date(postedAt).getTime() < NEW_BADGE_HOURS * 3600000;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DEDUPLICATION  — url + title-company slug
// ─────────────────────────────────────────────────────────────────────────────
function normalizeStr(str = '') { return str.toLowerCase().replace(/[^a-z0-9]/g, ''); }

function deduplicateJobs(jobs) {
  const seenUrls  = new Set();
  const seenSlugs = new Set();
  const out = [];
  for (const j of jobs) {
    if (j.url && seenUrls.has(j.url)) continue;
    const slug = `${normalizeStr(j.title)}-${normalizeStr(j.company)}`;
    if (seenSlugs.has(slug)) continue;
    if (j.url) seenUrls.add(j.url);
    seenSlugs.add(slug);
    out.push(j);
  }
  return out;
}

// Stable short id for sources that don't always give us one
function stableId(...parts) {
  return crypto.createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 16);
}

// ─────────────────────────────────────────────────────────────────────────────
//  BASE NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────
function base(extra) {
  return {
    stipend:  null,
    duration: null,
    logoUrl:  null,   // only set when the source API provides a real logo
    skills:   [],
    workMode: 'On-site',
    ...extra,
    isNew: isPostedRecently(extra.postedAt),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  NORMALIZERS — one per source
// ─────────────────────────────────────────────────────────────────────────────
function normalizeRemotiveJob(job, fetchedAt) {
  const title    = (job.title || 'Untitled Role').trim();
  const company  = (job.company_name || 'Unknown Company').trim();
  const tags     = Array.isArray(job.tags) ? job.tags.slice(0, 8) : [];
  const location = job.candidate_required_location || 'Remote / Worldwide';
  return base({
    id:       `remotive-${job.id}`,
    title, company, location,
    url:      job.url || '',
    source:   'Remotive',
    postedAt: job.publication_date ? new Date(job.publication_date).toISOString() : fetchedAt,
    fetchedAt, tags, skills: tags,
    isRemote: true,
    workMode: 'Remote',
    isInternship: checkIsInternship(title, tags),
    country:  detectCountry(location),
    description: job.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
  });
}

function normalizeArbeitnowJob(job, fetchedAt) {
  const title    = (job.title || 'Untitled Role').trim();
  const company  = (job.company_name || 'Unknown Company').trim();
  const tags     = Array.isArray(job.tags) ? job.tags.slice(0, 8) : [];
  const location = job.location || 'Remote';
  const isRemote = job.remote === true || location.toLowerCase().includes('remote');
  return base({
    id:       `arbeitnow-${job.slug || stableId(job.url, title, company)}`,
    title, company, location,
    url:      job.url || '',
    source:   'Arbeitnow',
    postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : fetchedAt,
    fetchedAt, tags, skills: tags,
    isRemote,
    workMode: detectWorkMode(location, isRemote),
    isInternship: checkIsInternship(title, tags),
    country:  detectCountry(location),
    description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 200),
  });
}

function normalizeAdzunaJob(job, fetchedAt) {
  const title    = (job.title || 'Untitled Role').trim();
  const company  = (job.company?.display_name || 'Unknown Company').trim();
  const location = job.location?.display_name || job.location?.area?.join(', ') || 'India';
  const tags     = [job.category?.label].filter(Boolean);
  const currency = location.toLowerCase().includes('india') ? 'INR' : 'USD';
  const stipend  = parseStipend(job.salary_min, job.salary_max, currency);
  return base({
    id:       `adzuna-${job.id}`,
    title, company, location,
    url:      job.redirect_url || '',
    source:   'Adzuna',
    postedAt: job.created ? new Date(job.created).toISOString() : fetchedAt,
    fetchedAt, tags, skills: tags, stipend,
    isRemote: location.toLowerCase().includes('remote'),
    workMode: detectWorkMode(location),
    isInternship: checkIsInternship(title, tags),
    country:  detectCountry(location),
    description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 200),
  });
}

function normalizeJSearchJob(job, fetchedAt) {
  const title    = (job.job_title || 'Untitled Role').trim();
  const company  = (job.employer_name || 'Unknown Company').trim();
  const location = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'Worldwide';
  const skills   = (job.job_required_skills || []).slice(0, 8);
  const stipend  = parseStipend(job.job_min_salary, job.job_max_salary, job.job_salary_currency || 'USD');
  return base({
    id:       `jsearch-${job.job_id}`,
    title, company, location,
    url:      job.job_apply_link || job.job_google_link || '',
    source:   'JSearch',
    postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toISOString() : fetchedAt,
    fetchedAt, tags: skills, skills, stipend,
    duration: job.job_employment_type_text || null,
    isRemote: job.job_is_remote === true,
    workMode: detectWorkMode(location, job.job_is_remote),
    isInternship: checkIsInternship(title, skills, job.job_employment_type),
    country:  detectCountry(location),
    logoUrl:  job.employer_logo || null,
    description: (job.job_description || '').slice(0, 200),
  });
}

function normalizeMuseJob(job, fetchedAt) {
  const title    = (job.name || 'Untitled Role').trim();
  const company  = (job.company?.name || 'Unknown Company').trim();
  const location = (job.locations || []).map(l => l.name).join(', ') || 'Remote';
  const tags     = (job.tags || []).map(t => t.name).slice(0, 8);
  const isRemote = location.toLowerCase().includes('remote') ||
    (job.locations || []).some(l => l.name.toLowerCase().includes('remote'));
  return base({
    id:       `muse-${job.id}`,
    title, company, location,
    url:      job.refs?.landing_page || '',
    source:   'The Muse',
    postedAt: job.publication_date ? new Date(job.publication_date).toISOString() : fetchedAt,
    fetchedAt, tags, skills: tags,
    isRemote,
    workMode: detectWorkMode(location, isRemote),
    isInternship: checkIsInternship(title, tags) ||
      (job.level || []).some(l => l.name?.toLowerCase().includes('intern')),
    country:  detectCountry(location),
    description: '',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  REQUEST HELPER — runs requests in parallel and logs every failure with its
//  reason, so a source that silently returns 0 jobs is visible in the logs.
// ─────────────────────────────────────────────────────────────────────────────
async function settleRequests(label, requests) {
  const results = await Promise.allSettled(requests);
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length) {
    const reasons = [...new Set(failures.map(f =>
      f.reason?.response ? `HTTP ${f.reason.response.status}` : (f.reason?.code || f.reason?.message || 'unknown error')
    ))];
    console.warn(`[${label}] ${failures.length}/${results.length} requests failed (${reasons.join(', ')})`);
  }
  return results.filter(r => r.status === 'fulfilled').map(r => r.value);
}

// ─────────────────────────────────────────────────────────────────────────────
//  API FETCHERS
// ─────────────────────────────────────────────────────────────────────────────
async function fetchRemotive(fetchedAt) {
  try {
    const queries = ['intern', 'internship', 'student', 'entry level', 'graduate'];
    const responses = await settleRequests('Remotive', queries.map(q =>
      axios.get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}&limit=50`, {
        timeout: FETCH_TIMEOUT_MS, headers: { 'User-Agent': UA },
      })
    ));
    const raw = responses.flatMap(r => r.data?.jobs || []);
    console.log(`[Remotive] Fetched ${raw.length} raw jobs`);
    return raw.map(j => normalizeRemotiveJob(j, fetchedAt));
  } catch (err) {
    console.error(`[Remotive] Failed: ${err.message}`);
    return [];
  }
}

async function fetchArbeitnow(fetchedAt) {
  try {
    const responses = await settleRequests('Arbeitnow', [1, 2, 3].map(p =>
      axios.get(`https://www.arbeitnow.com/api/job-board-api?page=${p}`, {
        timeout: FETCH_TIMEOUT_MS, headers: { 'User-Agent': UA },
      })
    ));
    const raw = responses.flatMap(r => r.data?.data || []);
    console.log(`[Arbeitnow] Fetched ${raw.length} raw jobs`);
    return raw.map(j => normalizeArbeitnowJob(j, fetchedAt));
  } catch (err) {
    console.error(`[Arbeitnow] Failed: ${err.message}`);
    return [];
  }
}

async function fetchAdzuna(fetchedAt) {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) { console.log('[Adzuna] No key – skipping'); return []; }

  // ── Broad, worldwide queries — NOT India-locked ──────────────────────────
  const searches = [
    // India searches
    { what: 'software intern',      where: 'india',          country: 'in' },
    { what: 'data science intern',  where: 'india',          country: 'in' },
    { what: 'frontend intern',      where: 'india',          country: 'in' },
    { what: 'backend intern',       where: 'india',          country: 'in' },
    { what: 'machine learning intern', where: 'india',       country: 'in' },
    // UK searches
    { what: 'software internship',  where: 'london',         country: 'gb' },
    { what: 'technology intern',    where: 'united kingdom', country: 'gb' },
    // US searches
    { what: 'software engineering intern', where: '',        country: 'us' },
    { what: 'data intern',          where: '',               country: 'us' },
    // Remote / other
    { what: 'remote intern',        where: '',               country: 'gb' },
  ];

  try {
    const responses = await settleRequests('Adzuna', searches.map(s =>
      axios.get(`https://api.adzuna.com/v1/api/jobs/${s.country}/search/1`, {
        timeout: FETCH_TIMEOUT_MS,
        params: {
          app_id: appId, app_key: appKey,
          what: s.what,
          ...(s.where ? { where: s.where } : {}),
          results_per_page: 50,
        },
      })
    ));
    const raw = responses.flatMap(r => r.data?.results || []);
    console.log(`[Adzuna] Fetched ${raw.length} raw jobs`);
    return raw.map(j => normalizeAdzunaJob(j, fetchedAt));
  } catch (err) {
    console.error(`[Adzuna] Failed: ${err.message}`);
    return [];
  }
}

async function fetchJSearch(fetchedAt) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) { console.log('[JSearch] No key – skipping'); return []; }

  // ── Broad, worldwide queries — NOT India-locked ──────────────────────────
  const queries = [
    'software engineering internship',
    'frontend developer internship',
    'backend developer internship',
    'data science internship',
    'machine learning internship',
    'product management internship',
    'software engineering internship india',
    'tech internship remote',
    'full stack internship',
    'devops internship',
  ];

  try {
    const responses = await settleRequests('JSearch', queries.map(q =>
      axios.get('https://jsearch.p.rapidapi.com/search', {
        timeout: FETCH_TIMEOUT_MS,
        headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
        params: { query: q, page: '1', num_pages: '1', employment_types: 'INTERN' },
      })
    ));
    const raw = responses.flatMap(r => r.data?.data || []);
    console.log(`[JSearch] Fetched ${raw.length} raw jobs`);
    return raw.map(j => normalizeJSearchJob(j, fetchedAt));
  } catch (err) {
    console.error(`[JSearch] Failed: ${err.message}`);
    return [];
  }
}

async function fetchMuse(fetchedAt) {
  try {
    const categories = ['Engineering', 'Computer and IT', 'Data Science', 'Design and UX', 'Product'];
    const params = { level: 'Internship', page: 0 };
    const key = process.env.MUSE_API_KEY;
    if (key) params.api_key = key;

    const responses = await settleRequests('The Muse', categories.map(cat =>
      axios.get('https://www.themuse.com/api/public/jobs', {
        timeout: FETCH_TIMEOUT_MS,
        params: { ...params, category: cat },
        headers: { 'User-Agent': UA },
      })
    ));
    const raw = responses.flatMap(r => r.data?.results || []);
    console.log(`[The Muse] Fetched ${raw.length} raw jobs`);
    return raw.map(j => normalizeMuseJob(j, fetchedAt));
  } catch (err) {
    console.error(`[The Muse] Failed: ${err.message}`);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN AGGREGATOR  — only real API data, nothing hardcoded
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAllJobs() {
  const fetchedAt = new Date().toISOString();
  console.log(`\n[JobService] Starting multi-source fetch at ${fetchedAt}`);

  // All sources run in parallel — any failure just returns []
  const [remotive, arbeitnow, adzuna, jsearch, muse] = await Promise.all([
    fetchRemotive(fetchedAt),
    fetchArbeitnow(fetchedAt),
    fetchAdzuna(fetchedAt),
    fetchJSearch(fetchedAt),
    fetchMuse(fetchedAt),
  ]);

  const liveJobs = [...remotive, ...arbeitnow, ...adzuna, ...jsearch, ...muse];

  lastSourceCounts = {
    remotive:  remotive.length,
    arbeitnow: arbeitnow.length,
    adzuna:    adzuna.length,
    jsearch:   jsearch.length,
    muse:      muse.length,
  };
  console.log(`[JobService] Live source counts: ${JSON.stringify({ ...lastSourceCounts, liveTotal: liveJobs.length })}`);

  // ── Remove expired posts ──────────────────────────────────────────────────
  const active = liveJobs.filter(j => !isExpired(j.postedAt));

  // ── Deduplicate ───────────────────────────────────────────────────────────
  const unique = deduplicateJobs(active);

  // ── Sort: internships first → newest ─────────────────────────────────────
  unique.sort((a, b) => {
    if (a.isInternship !== b.isInternship) return a.isInternship ? -1 : 1;
    return new Date(b.postedAt) - new Date(a.postedAt);
  });

  const internships = unique.filter(j => j.isInternship).length;
  console.log(`[JobService] ${unique.length} unique jobs after dedup + expiry filter (${internships} internships)\n`);
  return unique;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CACHE REFRESH  — single-flight: concurrent callers share one fetch
// ─────────────────────────────────────────────────────────────────────────────
function refreshCache() {
  if (inFlight) return inFlight;

  inFlight = fetchAllJobs()
    .then(jobs => {
      if (jobs.length > 0) {
        jobsCache     = jobs;
        lastFetchTime = Date.now();
      } else {
        // Every source failed or returned nothing. Keep any previous data and
        // try again after a short back-off instead of caching an empty list.
        console.warn('[JobService] All sources returned 0 jobs — keeping previous cache, retrying soon');
        jobsCache     = jobsCache || [];
        lastFetchTime = Date.now() - CACHE_DURATION_MS + EMPTY_RETRY_MS;
      }
      return jobsCache;
    })
    .catch(err => {
      console.error('[JobService] Fetch failed:', err.message);
      return jobsCache || [];
    })
    .finally(() => { inFlight = null; });

  return inFlight;
}

// Keep the cache warm in the background. unref() so this timer never keeps
// the process (or a test run) alive on its own.
setInterval(() => {
  console.log('[JobService] Auto-refreshing cache...');
  refreshCache();
}, CACHE_DURATION_MS).unref();

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────
async function getJobs() {
  const stale = !lastFetchTime || (Date.now() - lastFetchTime >= CACHE_DURATION_MS);

  if (jobsCache && !stale) return jobsCache;

  // Stale but we have data: serve it now and refresh in the background
  if (jobsCache && jobsCache.length > 0) {
    refreshCache();
    return jobsCache;
  }

  // Nothing cached yet: wait for the (shared) fetch
  return refreshCache();
}

function forceRefresh() {
  lastFetchTime = null;
  return refreshCache();
}

function getCacheStatus() {
  return {
    cached:               !!jobsCache,
    lastFetchTime:        lastFetchTime ? new Date(lastFetchTime).toISOString() : null,
    nextRefresh:          lastFetchTime ? new Date(lastFetchTime + CACHE_DURATION_MS).toISOString() : null,
    jobCount:             jobsCache?.length ?? 0,
    internshipCount:      jobsCache ? jobsCache.filter(j => j.isInternship).length : 0,
    sourceCounts:         lastSourceCounts,
    cacheDurationMinutes: CACHE_DURATION_MS / 60000,
  };
}

// Test-only: reset module state between tests
function _resetForTests() {
  jobsCache = null; lastFetchTime = null; lastSourceCounts = null; inFlight = null;
}

module.exports = {
  getJobs, getCacheStatus, forceRefresh,
  // exported for tests
  checkIsInternship, deduplicateJobs, detectCountry, isPostedRecently, _resetForTests,
};
