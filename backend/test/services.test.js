'use strict';
// Point the mailer at a dummy SMTP config so requiring emailService never
// reaches out to Ethereal over the network. createTransport() doesn't connect.
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_USER = 'test';
process.env.SMTP_PASS = 'test';
// Only the free sources run in these tests
delete process.env.ADZUNA_APP_ID;
delete process.env.ADZUNA_APP_KEY;
delete process.env.RAPIDAPI_KEY;
delete process.env.JOOBLE_API_KEY;

const test   = require('node:test');
const assert = require('node:assert/strict');
const axios  = require('axios');
const jobService = require('../src/services/jobService');
const { jobCardHtml } = require('../src/services/emailService');
const { isDue } = require('../src/services/alertService');

const realGet = axios.get;
const delay = ms => new Promise(r => setTimeout(r, ms));

function stubAxios(handler) {
  const calls = [];
  axios.get = async (url, opts) => { calls.push(url); await delay(20); return handler(url, opts); };
  return calls;
}

test.afterEach(() => {
  axios.get = realGet;
  jobService._resetForTests();
});

test('concurrent getJobs() calls share one upstream fetch', async () => {
  const nowSec = Math.floor(Date.now() / 1000);
  const calls = stubAxios(url => {
    if (url.includes('arbeitnow')) {
      return { data: { data: [{ slug: 'acme-intern', title: 'Software Intern', company_name: 'Acme', location: 'Berlin', created_at: nowSec, url: 'https://example.com/1', tags: [] }] } };
    }
    if (url.includes('remotive')) return { data: { jobs: [] } };
    throw Object.assign(new Error('blocked'), { response: { status: 403 } });  // The Muse
  });

  const results = await Promise.all([jobService.getJobs(), jobService.getJobs(), jobService.getJobs()]);

  const arbeitnowPage1 = calls.filter(u => u.includes('arbeitnow') && u.includes('page=1'));
  assert.equal(arbeitnowPage1.length, 1, 'expected exactly one fetch cycle');
  for (const jobs of results) {
    assert.equal(jobs.length, 1);            // 3 identical pages deduplicated to 1 job
    assert.equal(jobs[0].source, 'Arbeitnow');
    assert.equal(jobs[0].isNew, true);       // posted just now
    assert.equal(jobs[0].logoUrl, null);     // no guessed third-party logo URLs
  }
});

test('no hardcoded listings are mixed into the feed', async () => {
  stubAxios(() => { throw new Error('network down'); });
  const jobs = await jobService.getJobs();
  assert.deepEqual(jobs, []);
  assert.equal(jobService.getCacheStatus().sourceCounts.arbeitnow, 0);
});

test('job alert email escapes third-party data', () => {
  const html = jobCardHtml({
    title:    '<img src=x onerror=alert(1)>',
    company:  'Evil "Co"',
    location: '<b>Berlin</b>',
    url:      'javascript:alert(1)',
    tags:     ['<script>'],
  });
  assert.ok(!html.includes('<img src=x'), 'title must be escaped');
  assert.ok(!html.includes('<script>'), 'tags must be escaped');
  assert.ok(!html.includes('<b>Berlin</b>'), 'location must be escaped');
  assert.ok(html.includes('href="#"'), 'non-http links must be neutralised');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('alert frequency gating', () => {
  const now = Date.now();
  const hoursAgo = h => new Date(now - h * 3600000);
  const sub = (frequency, lastAlertSentAt) => ({ preferences: { frequency }, lastAlertSentAt });

  assert.equal(isDue(sub('instant', hoursAgo(0.5)), now), true);
  assert.equal(isDue(sub('6hours',  hoursAgo(2)),   now), false);
  assert.equal(isDue(sub('6hours',  hoursAgo(6)),   now), true);
  assert.equal(isDue(sub('daily',   hoursAgo(12)),  now), false);
  assert.equal(isDue(sub('daily',   hoursAgo(24)),  now), true);
  assert.equal(isDue(sub('daily',   null),          now), true);   // never emailed yet
});
