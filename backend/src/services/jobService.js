'use strict';
/**
 * The job feed: every source fetched on its own schedule, merged, de-duplicated and
 * sorted India first. Only real API data, nothing hardcoded.
 *
 *   Source            Key                Refresh      What it adds
 *   Company careers   none               3 h          Indian openings from 44 companies' own job boards
 *   JSearch           RAPIDAPI_KEY       24 h         Google Jobs searches in India (free plan: 200 requests a month)
 *   Adzuna            ADZUNA_APP_ID/KEY  6 h          Adzuna India
 *   Jooble            JOOBLE_API_KEY     6 h          Indian job sites
 *   Himalayas         none               3 h          remote roles open to India
 *   Jobicy            none               6 h          remote roles in Asia-Pacific
 *   Remotive          none               30 min       remote internships worldwide
 *   Arbeitnow         none               30 min       internships in Europe
 *
 * The keyed sources' results are saved in MongoDB, so a restart or a second server on
 * the same database reuses them instead of spending its quota again.
 */
const axios = require('axios');
const crypto = require('node:crypto');
const { isDBConnected } = require('../config/db');
const {
  FETCH_TIMEOUT_MS, UA, detectCountry, detectWorkMode, checkIsInternship, parseStipend,
  isPostedRecently, isoDate, stripHtml, stableId, base, settleRequests, reasonOf,
} = require('./jobs/helpers');
const { fetchCompanyBoards } = require('./jobs/companyBoards');
const { fetchHimalayas, fetchJobicy } = require('./jobs/remoteBoards');
const { fetchJooble } = require('./jobs/jooble');

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS AND STATE
// ─────────────────────────────────────────────────────────────────────────────
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const CACHE_DURATION_MS = 30 * MINUTE;   // how often the merged feed is rebuilt
const EMPTY_RETRY_MS    = 2 * MINUTE;    // rebuild sooner when every source came back empty
const FREE_RETRY_MS     = 15 * MINUTE;   // a free source that failed is tried again this soon
const JOB_MAX_AGE_DAYS  = 60;

let jobsCache        = null;
let lastFetchTime    = null;
let lastSourceCounts = null;
let lastSourceStatus = null;
let inFlight         = null;     // the one rebuild currently running, shared by all callers
const sourceState    = new Map(); // key -> { jobs, fetchedAt (ms), error }

function isExpired(postedAt) {
  if (!postedAt) return false;
  return Date.now() - new Date(postedAt).getTime() > JOB_MAX_AGE_DAYS * 86400000;
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

// ─────────────────────────────────────────────────────────────────────────────
//  NORMALIZERS for the sources defined in this file
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
    postedAt: isoDate(job.publication_date, fetchedAt),
    fetchedAt, tags, skills: tags,
    isRemote: true,
    workMode: 'Remote',
    isInternship: checkIsInternship(title, tags),
    country:  detectCountry(location),
    description: stripHtml(job.description || '').slice(0, 200),
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
    description: stripHtml(job.description || '').slice(0, 200),
  });
}

function normalizeAdzunaJob(job, fetchedAt) {
  const title    = stripHtml(job.title || 'Untitled Role');
  const company  = (job.company?.display_name || 'Unknown Company').trim();
  const location = job.location?.display_name || job.location?.area?.join(', ') || 'India';
  const tags     = [job.category?.label].filter(Boolean);
  return base({
    id:       `adzuna-${job.id}`,
    title, company, location,
    url:      job.redirect_url || '',
    source:   'Adzuna',
    postedAt: isoDate(job.created, fetchedAt),
    fetchedAt, tags, skills: tags,
    stipend:  parseStipend(job.salary_min, job.salary_max, 'INR'),   // Adzuna India pays in rupees
    isRemote: location.toLowerCase().includes('remote'),
    workMode: detectWorkMode(location),
    isInternship: checkIsInternship(title, tags, job.contract_time),
    country:  'India',
    description: stripHtml(job.description || '').slice(0, 200),
  });
}

function normalizeJSearchJob(job, fetchedAt) {
  const title    = (job.job_title || 'Untitled Role').trim();
  const company  = (job.employer_name || 'Unknown Company').trim();
  const location = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'India';
  const skills   = (job.job_required_skills || []).slice(0, 8);
  const stipend  = parseStipend(job.job_min_salary, job.job_max_salary, job.job_salary_currency || 'USD');
  return base({
    id:       `jsearch-${job.job_id}`,
    title, company, location,
    url:      job.job_apply_link || job.job_google_link || '',
    source:   'JSearch',
    postedAt: isoDate(job.job_posted_at_datetime_utc, fetchedAt),
    fetchedAt, tags: skills, skills, stipend,
    duration: job.job_employment_type_text || null,
    isRemote: job.job_is_remote === true,
    workMode: detectWorkMode(location, job.job_is_remote),
    isInternship: checkIsInternship(title, skills, job.job_employment_type),
    country:  job.job_country === 'IN' ? 'India' : detectCountry(location),
    logoUrl:  job.employer_logo || null,
    description: (job.job_description || '').slice(0, 200),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  FETCHERS for the sources defined in this file
// ─────────────────────────────────────────────────────────────────────────────
const getJson = (url, params, headers = {}, timeout = FETCH_TIMEOUT_MS) =>
  axios.get(url, { timeout, headers: { 'User-Agent': UA, ...headers }, params });

// A 5-page JSearch search takes well over 15 s, and a search that times out is still
// charged against the monthly quota, so it gets a minute.
const JSEARCH_TIMEOUT_MS = 60000;

async function fetchRemotive(fetchedAt) {
  const queries = ['intern', 'internship', 'student', 'entry level', 'graduate'];
  const responses = await settleRequests('Remotive', queries.map(q =>
    getJson(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}&limit=50`)
  ));
  const raw = responses.flatMap(r => r.data?.jobs || []);
  console.log(`[Remotive] Fetched ${raw.length} raw jobs`);
  return raw.map(j => normalizeRemotiveJob(j, fetchedAt));
}

async function fetchArbeitnow(fetchedAt) {
  // its newest page only: it lists European roles, so it no longer outweighs India
  const responses = await settleRequests('Arbeitnow', [
    getJson('https://www.arbeitnow.com/api/job-board-api?page=1'),
  ]);
  const raw = responses.flatMap(r => r.data?.data || []);
  console.log(`[Arbeitnow] Fetched ${raw.length} raw jobs`);
  return raw.map(j => normalizeArbeitnowJob(j, fetchedAt));
}

// Adzuna India only. Six searches every 6 hours is 24 requests a day, well inside
// the free plan's limits (which the old ten searches every 30 minutes overran).
const ADZUNA_SEARCHES = ['intern', 'internship', 'fresher', 'graduate trainee', 'software engineer', 'data analyst'];

async function fetchAdzuna(fetchedAt) {
  const responses = await settleRequests('Adzuna', ADZUNA_SEARCHES.map(what =>
    getJson('https://api.adzuna.com/v1/api/jobs/in/search/1', {
      app_id: process.env.ADZUNA_APP_ID, app_key: process.env.ADZUNA_APP_KEY,
      what, results_per_page: 50, max_days_old: 30, sort_by: 'date',
    })
  ));
  const raw = responses.flatMap(r => r.data?.results || []);
  console.log(`[Adzuna] Fetched ${raw.length} raw jobs`);
  return raw.map(j => normalizeAdzunaJob(j, fetchedAt));
}

// JSearch (Google Jobs) in India. Its free plan allows 200 requests a month, and a
// search of 2 to 10 pages costs 2 of them, so: 2 searches of 5 pages (about 100 jobs)
// once a day is 4 requests a day, about 120 a month.
const JSEARCH_SEARCHES = ['internship in India', 'fresher software engineer jobs in India'];
const jsearchHours = () => Math.max(1, Number(process.env.JSEARCH_REFRESH_HOURS) || 24);

async function fetchJSearch(fetchedAt) {
  const responses = await settleRequests('JSearch', JSEARCH_SEARCHES.map(query =>
    getJson('https://jsearch.p.rapidapi.com/search',
      { query, page: '1', num_pages: '5', country: 'in', date_posted: 'week' },
      { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
      JSEARCH_TIMEOUT_MS)
  ));
  const remaining = responses[0]?.headers?.['x-ratelimit-requests-remaining'];
  const raw = responses.flatMap(r => r.data?.data || []);
  console.log(`[JSearch] Fetched ${raw.length} raw jobs${remaining !== undefined ? ` (${remaining} requests left this month)` : ''}`);
  return raw.map(j => normalizeJSearchJob(j, fetchedAt));
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOURCES  — each on its own schedule
// ─────────────────────────────────────────────────────────────────────────────
const SOURCES = [
  { key: 'companies', label: 'Company careers', every: 3 * HOUR, run: fetchCompanyBoards },
  { key: 'jsearch',   label: 'JSearch',   every: () => jsearchHours() * HOUR, run: fetchJSearch, persist: true,
    apiKey: () => process.env.RAPIDAPI_KEY || '' },
  { key: 'adzuna',    label: 'Adzuna',    every: 6 * HOUR, run: fetchAdzuna, persist: true,
    apiKey: () => (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY ? `${process.env.ADZUNA_APP_ID}:${process.env.ADZUNA_APP_KEY}` : '') },
  { key: 'jooble',    label: 'Jooble',    every: 6 * HOUR, run: fetchJooble, persist: true,
    apiKey: () => process.env.JOOBLE_API_KEY || '' },
  { key: 'himalayas', label: 'Himalayas', every: 3 * HOUR, run: fetchHimalayas },
  { key: 'jobicy',    label: 'Jobicy',    every: 6 * HOUR, run: fetchJobicy },
  { key: 'remotive',  label: 'Remotive',  every: CACHE_DURATION_MS, run: fetchRemotive },
  { key: 'arbeitnow', label: 'Arbeitnow', every: CACHE_DURATION_MS, run: fetchArbeitnow },
];
const intervalOf = src => (typeof src.every === 'function' ? src.every() : src.every);

const SourceCache = () => require('../models/SourceCache');

/** A short fingerprint of an API key: never the key itself, only enough to notice it changed. */
const keyHash = key => (key ? crypto.createHash('sha256').update(key).digest('hex').slice(0, 16) : '');

async function readSaved(key, hash) {
  if (!isDBConnected()) return null;
  try {
    const doc = await SourceCache().findById(key).lean();
    if (!doc || (doc.keyHash || '') !== hash) return null;   // saved with another key: fetch afresh
    return { jobs: doc.jobs || [], fetchedAt: new Date(doc.fetchedAt).getTime(), error: doc.error || null, keyHash: hash };
  } catch (err) {
    console.warn(`[JobService] Could not read saved ${key} results: ${err.message}`);
    return null;
  }
}

async function writeSaved(key, state) {
  if (!isDBConnected()) return;
  try {
    await SourceCache().updateOne({ _id: key }, { $set: {
      fetchedAt: new Date(state.fetchedAt), jobs: state.jobs, error: state.error || null, keyHash: state.keyHash || '',
    } }, { upsert: true });
  } catch (err) {
    console.warn(`[JobService] Could not save ${key} results: ${err.message}`);
  }
}

/**
 * One source's current listings: from memory or the database when still fresh,
 * otherwise fetched now. A failed fetch keeps the listings from the last one that
 * worked. `force` refetches the free sources; the quota sources keep their schedule,
 * and a failed attempt is saved too, so restarts don't hammer a source that refuses
 * its key. A new key (a different fingerprint) is tried at once.
 */
async function loadSource(src, fetchedAtIso, force) {
  const apiKey = src.apiKey ? src.apiKey() : null;
  if (src.apiKey && !apiKey) return { jobs: [], fetchedAt: 0, error: null, configured: false };
  const hash = keyHash(apiKey || '');
  const now = Date.now();
  const every = intervalOf(src);
  let s = sourceState.get(src.key);
  if (s && src.persist && s.keyHash !== hash) s = null;   // the key changed since this was fetched

  if (src.persist && (!s || now - s.fetchedAt >= every)) {
    const saved = await readSaved(src.key, hash);    // this server before a restart, or another one, may have fetched it
    if (saved && (!s || saved.fetchedAt > s.fetchedAt)) { s = saved; sourceState.set(src.key, s); }
  }
  if (s && now - s.fetchedAt < every && !(force && !src.persist)) return s;

  try {
    const jobs = await src.run(fetchedAtIso);
    s = { jobs, fetchedAt: now, error: null, keyHash: hash };
    sourceState.set(src.key, s);
    if (src.persist) await writeSaved(src.key, s);
  } catch (err) {
    console.error(`[${src.label}] Failed: ${err.message}`);
    // keep the last good listings; a free source tries again in 15 minutes, a quota source on its schedule
    const retryAt = src.persist ? now : now - every + FREE_RETRY_MS;
    s = { jobs: s?.jobs || [], fetchedAt: retryAt, error: reasonOf(err), keyHash: hash };
    sourceState.set(src.key, s);
    if (src.persist) await writeSaved(src.key, s);
  }
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN AGGREGATOR
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAllJobs({ force = false } = {}) {
  const fetchedAt = new Date().toISOString();
  console.log(`\n[JobService] Building the feed at ${fetchedAt}${force ? ' (refresh requested)' : ''}`);

  const results = await Promise.all(SOURCES.map(src => loadSource(src, fetchedAt, force)));
  const liveJobs = results.flatMap(r => r.jobs);

  lastSourceCounts = Object.fromEntries(SOURCES.map((src, i) => [src.key, results[i].jobs.length]));
  lastSourceStatus = SOURCES.map((src, i) => ({
    key: src.key,
    label: src.label,
    count: results[i].jobs.length,
    configured: results[i].configured !== false,
    fetchedAt: results[i].fetchedAt ? new Date(results[i].fetchedAt).toISOString() : null,
    refreshMinutes: Math.round(intervalOf(src) / MINUTE),
    error: results[i].error || null,
  }));
  console.log(`[JobService] Source counts: ${JSON.stringify({ ...lastSourceCounts, total: liveJobs.length })}`);

  // a company's board lists only open roles, so its listings never expire by age
  const active = liveJobs.filter(j => j.openListing || !isExpired(j.postedAt));
  const unique = deduplicateJobs(active);

  // India first, then internships, then newest
  const india = j => (j.country === 'India' ? 1 : 0);
  unique.sort((a, b) =>
    india(b) - india(a) ||
    (b.isInternship ? 1 : 0) - (a.isInternship ? 1 : 0) ||
    new Date(b.postedAt) - new Date(a.postedAt));

  const internships = unique.filter(j => j.isInternship).length;
  const inIndia = unique.filter(j => j.country === 'India').length;
  console.log(`[JobService] ${unique.length} unique jobs (${inIndia} in India, ${internships} internships)\n`);
  return unique;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CACHE REFRESH  — single-flight: concurrent callers share one rebuild
// ─────────────────────────────────────────────────────────────────────────────
function refreshCache(options) {
  if (inFlight) return inFlight;

  inFlight = fetchAllJobs(options)
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

/** Rebuilds now, refetching the free sources; the quota sources keep their schedule. */
function forceRefresh() {
  lastFetchTime = null;
  return refreshCache({ force: true });
}

function getCacheStatus() {
  return {
    cached:               !!jobsCache,
    lastFetchTime:        lastFetchTime ? new Date(lastFetchTime).toISOString() : null,
    nextRefresh:          lastFetchTime ? new Date(lastFetchTime + CACHE_DURATION_MS).toISOString() : null,
    jobCount:             jobsCache?.length ?? 0,
    internshipCount:      jobsCache ? jobsCache.filter(j => j.isInternship).length : 0,
    indiaCount:           jobsCache ? jobsCache.filter(j => j.country === 'India').length : 0,
    sourceCounts:         lastSourceCounts,
    sources:              lastSourceStatus,
    cacheDurationMinutes: CACHE_DURATION_MS / 60000,
  };
}

// Test-only: reset module state between tests
function _resetForTests() {
  jobsCache = null; lastFetchTime = null; lastSourceCounts = null; lastSourceStatus = null; inFlight = null;
  sourceState.clear();
}

module.exports = {
  getJobs, getCacheStatus, forceRefresh,
  SOURCES: SOURCES.map(({ key, label }) => ({ key, label })),
  // exported for tests
  checkIsInternship, deduplicateJobs, detectCountry, isPostedRecently, _resetForTests,
  normalizeJSearchJob, normalizeAdzunaJob,
};
