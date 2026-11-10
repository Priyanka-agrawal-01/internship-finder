'use strict';
/**
 * Openings in India straight from companies' own careers pages (Greenhouse, Lever,
 * Ashby and SmartRecruiters job boards; see data/companyBoards.js). Free, no keys.
 * Every listing is an open role the company posted itself, linking to its own
 * application page.
 */
const axios = require('axios');
const BOARDS = require('../../data/companyBoards');
const {
  FETCH_TIMEOUT_MS, UA, isIndia, checkIsInternship, isoDate, base, mapLimit,
} = require('./helpers');

const SOURCE = 'Company careers';
const SMARTRECRUITERS_MAX = 300;   // per company: 3 pages of 100

const get = (url, params) => axios.get(url, { timeout: FETCH_TIMEOUT_MS, headers: { 'User-Agent': UA }, params });

const workMode = (type, location = '') => {
  const t = String(type || '').toLowerCase();
  if (t.includes('remote')) return 'Remote';
  if (t.includes('hybrid')) return 'Hybrid';
  if (/remote/i.test(location)) return 'Remote';
  if (/hybrid/i.test(location)) return 'Hybrid';
  return 'On-site';
};

function job(board, { id, title, location, url, postedAt, mode, type, tags = [] }, fetchedAt) {
  const clean = (title || 'Untitled Role').trim();
  return base({
    id:       `co-${board.platform}-${board.slug.toLowerCase()}-${id}`,
    title:    clean,
    company:  board.name,
    location: location || 'India',
    url:      url || '',
    source:   SOURCE,
    postedAt: isoDate(postedAt, fetchedAt),
    fetchedAt,
    tags, skills: tags,
    isRemote: mode === 'Remote',
    workMode: mode,
    isInternship: checkIsInternship(clean, tags, type),
    country:  'India',   // only Indian openings are kept
    description: '',
    // a company's board lists only roles that are open now, however long ago they were posted
    openListing: true,
  });
}

const PLATFORMS = {
  async greenhouse(board, fetchedAt) {
    const { data } = await get(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs`);
    return (data?.jobs || [])
      .filter(j => isIndia(j.location?.name))
      .map(j => job(board, {
        id: j.id, title: j.title, location: j.location?.name, url: j.absolute_url,
        postedAt: j.first_published || j.updated_at, mode: workMode('', j.location?.name),
      }, fetchedAt));
  },

  async lever(board, fetchedAt) {
    const { data } = await get(`https://api.lever.co/v0/postings/${board.slug}`, { mode: 'json' });
    return (Array.isArray(data) ? data : [])
      .filter(j => j.country === 'IN' || isIndia(j.categories?.location, ...(j.categories?.allLocations || [])))
      .map(j => job(board, {
        id: j.id, title: j.text, location: j.categories?.location, url: j.hostedUrl,
        postedAt: j.createdAt, mode: workMode(j.workplaceType, j.categories?.location),
        type: j.categories?.commitment, tags: [j.categories?.team, j.categories?.department].filter(Boolean),
      }, fetchedAt));
  },

  async ashby(board, fetchedAt) {
    const { data } = await get(`https://api.ashbyhq.com/posting-api/job-board/${board.slug}`);
    return (data?.jobs || [])
      .filter(j => j.isListed !== false)
      .filter(j => isIndia(j.location, j.address?.postalAddress?.addressCountry, ...(j.secondaryLocations || []).map(l => l.location)))
      .map(j => job(board, {
        id: j.id, title: j.title, location: j.location, url: j.jobUrl, postedAt: j.publishedAt,
        mode: j.isRemote ? 'Remote' : workMode(j.workplaceType, j.location),
        type: j.employmentType, tags: [j.team, j.department].filter(Boolean),
      }, fetchedAt));
  },

  async smartrecruiters(board, fetchedAt) {
    const out = [];
    for (let offset = 0; offset < SMARTRECRUITERS_MAX; offset += 100) {
      const { data } = await get(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(board.slug)}/postings`, { country: 'in', limit: 100, offset });
      const page = data?.content || [];
      out.push(...page);
      if (page.length < 100 || out.length >= (data?.totalFound || 0)) break;
    }
    return out.map(j => job(board, {
      id: j.id, title: j.name, location: j.location?.fullLocation || [j.location?.city, 'India'].filter(Boolean).join(', '),
      url: `https://jobs.smartrecruiters.com/${encodeURIComponent(board.slug)}/${j.id}`,
      postedAt: j.releasedDate,
      mode: j.location?.remote ? 'Remote' : j.location?.hybrid ? 'Hybrid' : 'On-site',
      type: [j.typeOfEmployment?.label, j.experienceLevel?.id === 'internship' ? 'internship' : ''].join(' '),
      tags: [j.department?.label, j.function?.label].filter(Boolean),
    }, fetchedAt));
  },
};

/** Indian openings from every board in data/companyBoards.js, 6 boards at a time. */
async function fetchCompanyBoards(fetchedAt) {
  const results = await mapLimit(BOARDS, 6, board => PLATFORMS[board.platform](board, fetchedAt));
  const failed = [];
  const jobs = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') jobs.push(...r.value);
    else failed.push(`${BOARDS[i].name} (${r.reason?.response ? `HTTP ${r.reason.response.status}` : r.reason?.code || r.reason?.message})`);
  });
  if (failed.length) console.warn(`[Company careers] ${failed.length}/${BOARDS.length} boards failed: ${failed.join(', ')}`);
  if (failed.length === BOARDS.length) throw new Error('every company board failed');
  console.log(`[Company careers] ${jobs.length} openings in India from ${BOARDS.length - failed.length} companies`);
  return jobs;
}

module.exports = { fetchCompanyBoards, SOURCE };
