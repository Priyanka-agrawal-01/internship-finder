'use strict';
/**
 * Remote roles that people in India can apply for, from two free boards
 * (no keys; both ask that listings link back to them, which every card does):
 *   Himalayas  https://himalayas.app/jobs/api   (search, country=India)
 *   Jobicy     https://jobicy.com/api/v2/remote-jobs   (geo=apac)
 */
const axios = require('axios');
const {
  FETCH_TIMEOUT_MS, UA, isIndia, checkIsInternship, parseStipend, isoDate, stripHtml, stableId, base, settleRequests,
} = require('./helpers');

const get = (url, params) => axios.get(url, { timeout: FETCH_TIMEOUT_MS, headers: { 'User-Agent': UA }, params });

// ── Himalayas ─────────────────────────────────────────────────────────────────
// 20 jobs a page; internships and entry-level roles open to India, newest first.
const HIMALAYAS_SEARCHES = [
  { q: 'intern', page: 1 }, { q: 'intern', page: 2 },
  { seniority: 'entry-level', page: 1 }, { seniority: 'entry-level', page: 2 },
  { q: 'software engineer', page: 1 },
  { q: 'data analyst', page: 1 },
];

function normalizeHimalayasJob(j, fetchedAt) {
  const restrictions = Array.isArray(j.locationRestrictions) ? j.locationRestrictions : [];
  const indiaOnly = restrictions.some(r => isIndia(r));
  const title = (j.title || 'Untitled Role').trim();
  const tags = [...(j.categories || []), ...(j.seniority || [])].slice(0, 8);
  return base({
    id:       `himalayas-${stableId(j.guid || j.applicationLink || `${title}|${j.companyName}`)}`,
    title,
    company:  (j.companyName || 'Unknown Company').trim(),
    location: restrictions.length ? `Remote (${restrictions.slice(0, 3).join(', ')})` : 'Remote, worldwide',
    url:      j.applicationLink || '',
    source:   'Himalayas',
    postedAt: isoDate(j.pubDate, fetchedAt),
    fetchedAt, tags, skills: tags,
    stipend:  parseStipend(j.minSalary, j.maxSalary, j.currency || 'USD'),
    isRemote: true,
    workMode: 'Remote',
    // title and employment type only: Himalayas tags most junior roles "Entry-level", which is not an internship
    isInternship: checkIsInternship(title, [], j.employmentType),
    country:  indiaOnly ? 'India' : 'Remote',
    logoUrl:  j.companyLogo || null,
    description: stripHtml(j.excerpt || '').slice(0, 200),
  });
}

async function fetchHimalayas(fetchedAt) {
  const responses = await settleRequests('Himalayas', HIMALAYAS_SEARCHES.map(s =>
    get('https://himalayas.app/jobs/api/search', { country: 'India', ...s })
  ));
  const raw = responses.flatMap(r => r.data?.jobs || []);
  console.log(`[Himalayas] ${raw.length} remote jobs open to India`);
  return raw.map(j => normalizeHimalayasJob(j, fetchedAt));
}

// ── Jobicy ────────────────────────────────────────────────────────────────────
// Its region filter has no India of its own; Asia-Pacific listings are kept when
// they name India, Asia-Pacific or anywhere.
const JOBICY_OPEN = /india|apac|asia|anywhere|worldwide|global/i;

function normalizeJobicyJob(j, fetchedAt) {
  const title = stripHtml(j.jobTitle || 'Untitled Role');
  const tags = [...(j.jobIndustry || []), ...(j.jobType || [])].map(stripHtml).slice(0, 8);
  return base({
    id:       `jobicy-${j.id || stableId(j.url, title)}`,
    title,
    company:  stripHtml(j.companyName || 'Unknown Company'),
    location: `Remote (${stripHtml(j.jobGeo || 'Asia-Pacific')})`,
    url:      j.url || '',
    source:   'Jobicy',
    postedAt: isoDate(j.pubDate, fetchedAt),
    fetchedAt, tags, skills: tags,
    stipend:  parseStipend(j.annualSalaryMin, j.annualSalaryMax, j.salaryCurrency || 'USD'),
    isRemote: true,
    workMode: 'Remote',
    isInternship: checkIsInternship(title, tags, j.jobLevel),
    country:  isIndia(j.jobGeo) ? 'India' : 'Remote',
    logoUrl:  j.companyLogo || null,
    description: stripHtml(j.jobExcerpt || '').slice(0, 200),
  });
}

async function fetchJobicy(fetchedAt) {
  const { data } = await get('https://jobicy.com/api/v2/remote-jobs', { count: 50, geo: 'apac' });
  const raw = (data?.jobs || []).filter(j => JOBICY_OPEN.test(j.jobGeo || ''));
  console.log(`[Jobicy] ${raw.length} remote jobs open to Asia-Pacific or India`);
  return raw.map(j => normalizeJobicyJob(j, fetchedAt));
}

module.exports = { fetchHimalayas, fetchJobicy, normalizeHimalayasJob, normalizeJobicyJob };
