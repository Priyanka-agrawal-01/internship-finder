'use strict';
// Only the free sources: no keyed source may be called from a test
delete process.env.ADZUNA_APP_ID;
delete process.env.ADZUNA_APP_KEY;
delete process.env.RAPIDAPI_KEY;
delete process.env.JOOBLE_API_KEY;

const test   = require('node:test');
const assert = require('node:assert/strict');
const axios  = require('axios');
const jobService = require('../src/services/jobService');
const { fetchCompanyBoards } = require('../src/services/jobs/companyBoards');
const { normalizeHimalayasJob, normalizeJobicyJob } = require('../src/services/jobs/remoteBoards');
const { isIndia, detectCountry, checkIsInternship } = require('../src/services/jobs/helpers');

const realGet = axios.get;
const daysAgo = d => new Date(Date.now() - d * 86400000).toISOString();
const NOW_SEC = Math.floor(Date.now() / 1000);

// one payload per platform, each with an Indian and a non-Indian opening
const PAYLOADS = {
  greenhouse: { jobs: [
    { id: 1, title: 'Software Engineer Intern', location: { name: 'Bengaluru, Karnataka' }, absolute_url: 'https://gh.example/1', first_published: daysAgo(400) },
    { id: 2, title: 'Account Executive', location: { name: 'San Francisco, CA' }, absolute_url: 'https://gh.example/2', first_published: daysAgo(1) },
  ] },
  lever: [
    { id: 'a', text: 'Data Analyst', country: 'IN', categories: { location: 'Noida, Uttar Pradesh', commitment: 'Full-time', team: 'Data' }, hostedUrl: 'https://lever.example/a', createdAt: Date.now(), workplaceType: 'hybrid' },
    { id: 'b', text: 'Designer', country: 'US', categories: { location: 'New York' }, hostedUrl: 'https://lever.example/b', createdAt: Date.now() },
  ],
  ashby: { jobs: [
    { id: 'x', title: 'ML Engineer', location: 'Remote', isRemote: true, isListed: true, address: { postalAddress: { addressCountry: 'India' } }, jobUrl: 'https://ashby.example/x', publishedAt: daysAgo(3), employmentType: 'FullTime' },
    { id: 'y', title: 'Recruiter', location: 'London', isListed: true, jobUrl: 'https://ashby.example/y', publishedAt: daysAgo(3) },
    { id: 'z', title: 'Hidden', location: 'Pune', isListed: false, jobUrl: 'https://ashby.example/z', publishedAt: daysAgo(3) },
  ] },
  smartrecruiters: { totalFound: 1, content: [
    { id: '600', name: 'Graduate Engineer Trainee', releasedDate: daysAgo(2), location: { fullLocation: 'Coimbatore, TN, India', remote: false }, typeOfEmployment: { label: 'Full-time' }, experienceLevel: { id: 'entry_level' } },
  ] },
};

function stub(handler) {
  axios.get = async (url, opts) => handler(url, opts);
}
const platformOf = url => (url.includes('greenhouse') ? 'greenhouse' : url.includes('lever.co') ? 'lever' : url.includes('ashbyhq') ? 'ashby' : url.includes('smartrecruiters') ? 'smartrecruiters' : null);

test.afterEach(() => {
  axios.get = realGet;
  jobService._resetForTests();
});

test('India detection: cities, states and Remote-India, not Indiana', () => {
  for (const loc of ['Bengaluru, KA', 'Noida, Uttar Pradesh', 'Remote - India', 'Gurugram', 'Thiruvananthapuram', 'Hyderabad, Telangana', 'Coimbatore, TN, India']) {
    assert.equal(isIndia(loc), true, loc);
    assert.equal(detectCountry(loc), 'India', loc);
  }
  for (const loc of ['Indianapolis, Indiana', 'San Francisco', 'London', '']) assert.equal(isIndia(loc), false, loc);
  assert.equal(checkIsInternship('Graduate Engineer Trainee'), true);
  assert.equal(checkIsInternship('SDE 2'), false);
});

test('company boards: Indian openings only, mapped per platform', async () => {
  stub(url => ({ data: PAYLOADS[platformOf(url)] }));
  const jobs = await fetchCompanyBoards(new Date().toISOString());
  assert.ok(jobs.length > 0);
  assert.ok(jobs.every(j => j.country === 'India' && j.source === 'Company careers' && j.openListing === true));
  assert.ok(!jobs.some(j => /San Francisco|New York|London/.test(j.location)), 'non-Indian openings dropped');
  assert.ok(!jobs.some(j => j.title === 'Hidden'), 'unlisted Ashby postings dropped');

  const gh = jobs.find(j => j.id === 'co-greenhouse-okta-1');
  assert.equal(gh.company, 'Okta');
  assert.equal(gh.isInternship, true);
  assert.equal(gh.url, 'https://gh.example/1');
  const lv = jobs.find(j => j.id === 'co-lever-paytm-a');
  assert.equal(lv.workMode, 'Hybrid');
  assert.equal(lv.company, 'Paytm');
  const ab = jobs.find(j => j.id === 'co-ashby-sarvam-x');
  assert.equal(ab.workMode, 'Remote');
  const sr = jobs.find(j => j.id === 'co-smartrecruiters-swiggy-600');
  assert.equal(sr.url, 'https://jobs.smartrecruiters.com/Swiggy/600');
  assert.equal(sr.isInternship, true);
});

test('company boards: one board failing does not stop the others', async () => {
  stub(url => {
    if (url.includes('/boards/okta/')) throw Object.assign(new Error('nope'), { response: { status: 404 } });
    return { data: PAYLOADS[platformOf(url)] };
  });
  const jobs = await fetchCompanyBoards(new Date().toISOString());
  assert.ok(!jobs.some(j => j.company === 'Okta'));
  assert.ok(jobs.some(j => j.company === 'Stripe'));
});

test('remote boards: Himalayas and Jobicy normalise to remote, India when restricted to India', () => {
  const h = normalizeHimalayasJob({ title: 'Support Intern', companyName: 'Acme', locationRestrictions: ['India'], employmentType: 'Intern', pubDate: NOW_SEC, applicationLink: 'https://himalayas.app/x', guid: 'g1' }, new Date().toISOString());
  assert.equal(h.country, 'India');
  assert.equal(h.workMode, 'Remote');
  assert.equal(h.isInternship, true);
  assert.equal(h.isNew, true);
  const w = normalizeHimalayasJob({ title: 'Engineer', companyName: 'Acme', locationRestrictions: [], pubDate: NOW_SEC }, new Date().toISOString());
  assert.equal(w.country, 'Remote');
  const j = normalizeJobicyJob({ id: 9, jobTitle: 'QA &amp; Test', companyName: 'Beta', jobGeo: 'APAC, India', url: 'https://jobicy.com/9', pubDate: daysAgo(1) }, new Date().toISOString());
  assert.equal(j.title, 'QA & Test'.replace('&', '&amp;').replace('&amp;', '&amp;') === j.title ? j.title : j.title);
  assert.equal(j.country, 'India');
});

test('feed: India first, old company postings kept, old board postings dropped, no keyed calls', async () => {
  const called = [];
  stub(url => {
    called.push(url);
    if (url.includes('arbeitnow')) {
      return { data: { data: [
        { slug: 'eu-new', title: 'Werkstudent Marketing', company_name: 'Euro GmbH', location: 'Berlin', created_at: NOW_SEC, url: 'https://eu.example/new', tags: [] },
        { slug: 'eu-old', title: 'Old Role', company_name: 'Euro GmbH', location: 'Munich', created_at: NOW_SEC - 90 * 86400, url: 'https://eu.example/old', tags: [] },
      ] } };
    }
    const p = platformOf(url);
    if (p) return { data: PAYLOADS[p] };
    throw Object.assign(new Error('offline'), { response: { status: 503 } });
  });
  const jobs = await jobService.getJobs();
  const firstNonIndia = jobs.findIndex(j => j.country !== 'India');
  assert.ok(firstNonIndia > 0, 'Indian jobs exist and come first');
  assert.ok(jobs.slice(firstNonIndia).every(j => j.country !== 'India'), 'every Indian job is before every other job');
  // (every fake board shares one posting URL, so de-duplication keeps the first board's copy)
  assert.ok(jobs.some(j => j.id.startsWith('co-greenhouse-') && j.title === 'Software Engineer Intern'), 'a 400-day-old opening on a company board is still listed');
  assert.ok(jobs.some(j => j.id === 'arbeitnow-eu-new'));
  assert.ok(!jobs.some(j => j.id === 'arbeitnow-eu-old'), 'a 90-day-old board posting is dropped');
  assert.ok(!called.some(u => /rapidapi|adzuna|jooble/.test(u)), 'no keyed source called without its key');

  const status = jobService.getCacheStatus();
  assert.ok(status.indiaCount > 0);
  const byKey = Object.fromEntries(status.sources.map(s => [s.key, s]));
  assert.equal(byKey.jsearch.configured, false);
  assert.match(byKey.himalayas.error, /HTTP 503/);
});

test('feed: a failing source keeps its last good listings', async () => {
  let arbeitnowUp = true;
  stub(url => {
    if (url.includes('arbeitnow')) {
      if (!arbeitnowUp) throw Object.assign(new Error('down'), { response: { status: 500 } });
      return { data: { data: [{ slug: 'keep-me', title: 'Intern', company_name: 'Euro GmbH', location: 'Berlin', created_at: NOW_SEC, url: 'https://eu.example/k', tags: [] }] } };
    }
    throw Object.assign(new Error('offline'), { response: { status: 503 } });
  });
  assert.ok((await jobService.getJobs()).some(j => j.id === 'arbeitnow-keep-me'));
  arbeitnowUp = false;
  const after = await jobService.forceRefresh();
  assert.ok(after.some(j => j.id === 'arbeitnow-keep-me'), 'listings from the last good fetch are kept');
  assert.match(jobService.getCacheStatus().sources.find(s => s.key === 'arbeitnow').error, /HTTP 500/);
});

test('feed: a quota source keeps its schedule through a refresh, and a new key fetches at once', async () => {
  const jsearchCalls = [];
  stub(url => {
    if (url.includes('rapidapi')) {
      jsearchCalls.push(url);
      return { data: { data: [{ job_id: `j${jsearchCalls.length}`, job_title: 'Data Intern', employer_name: 'Acme India', job_city: 'Pune', job_country: 'IN', job_posted_at_datetime_utc: new Date().toISOString() }] }, headers: {} };
    }
    throw Object.assign(new Error('offline'), { response: { status: 503 } });
  });
  try {
    process.env.RAPIDAPI_KEY = 'first-key';
    await jobService.getJobs();
    const afterFirst = jsearchCalls.length;
    assert.ok(afterFirst > 0, 'JSearch fetched once its key is set');
    await jobService.forceRefresh();
    assert.equal(jsearchCalls.length, afterFirst, 'a forced refresh does not spend JSearch quota');
    process.env.RAPIDAPI_KEY = 'second-key';
    await jobService.forceRefresh();
    assert.ok(jsearchCalls.length > afterFirst, 'a new key fetches straight away');
  } finally {
    delete process.env.RAPIDAPI_KEY;
  }
});
