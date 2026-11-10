'use strict';
/**
 * Jooble (https://jooble.org/api/about): a search engine over many job sites,
 * including Indian ones. Needs a free key (JOOBLE_API_KEY), requested on that page.
 * Without the key this source is skipped.
 */
const axios = require('axios');
const {
  FETCH_TIMEOUT_MS, UA, detectCountry, detectWorkMode, checkIsInternship, isoDate, stripHtml, stableId, base, settleRequests,
} = require('./helpers');

const SEARCHES = [
  { keywords: 'internship', location: 'India' },
  { keywords: 'fresher software engineer', location: 'India' },
  { keywords: 'graduate trainee', location: 'India' },
  { keywords: 'software developer intern', location: 'Bangalore' },
  { keywords: 'data analyst intern', location: 'India' },
];

function normalizeJoobleJob(j, fetchedAt) {
  const title = stripHtml(j.title || 'Untitled Role');
  const location = stripHtml(j.location || 'India');
  return base({
    id:       `jooble-${j.id || stableId(j.link, title)}`,
    title,
    company:  stripHtml(j.company || 'Unknown Company'),
    location,
    url:      j.link || '',
    source:   'Jooble',
    postedAt: isoDate(j.updated, fetchedAt),
    fetchedAt,
    stipend:  j.salary ? stripHtml(j.salary).slice(0, 60) : null,
    duration: j.type || null,
    isRemote: /remote/i.test(location),
    workMode: detectWorkMode(location),
    isInternship: checkIsInternship(title, [], j.type),
    country:  detectCountry(location) === 'Worldwide' ? 'India' : detectCountry(location),
    description: stripHtml(j.snippet || '').slice(0, 200),
  });
}

async function fetchJooble(fetchedAt) {
  const key = process.env.JOOBLE_API_KEY;
  if (!key) return [];
  const responses = await settleRequests('Jooble', SEARCHES.map(s =>
    axios.post(`https://jooble.org/api/${encodeURIComponent(key)}`, { ...s, page: '1' }, {
      timeout: FETCH_TIMEOUT_MS, headers: { 'User-Agent': UA, 'Content-Type': 'application/json' },
    })
  ));
  const raw = responses.flatMap(r => r.data?.jobs || []);
  console.log(`[Jooble] ${raw.length} jobs`);
  return raw.map(j => normalizeJoobleJob(j, fetchedAt));
}

module.exports = { fetchJooble, normalizeJoobleJob };
