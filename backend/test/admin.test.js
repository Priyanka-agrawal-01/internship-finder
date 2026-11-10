'use strict';
const test   = require('node:test');
const assert = require('node:assert/strict');

const { buildVisit, parseUserAgent, isBot, hostOf } = require('../src/utils/analytics');
const { istDay, istMidnight, dayList, toCsv } = require('../src/services/adminStats');

const CHROME_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const EDGE = CHROME_WIN + ' Edg/130.0';

test('user agents: device, browser, os', () => {
  assert.deepEqual(parseUserAgent(CHROME_WIN), { device: 'Desktop', browser: 'Chrome', os: 'Windows' });
  assert.deepEqual(parseUserAgent(SAFARI_IPHONE), { device: 'Mobile', browser: 'Safari', os: 'iOS' });
  assert.deepEqual(parseUserAgent(ANDROID_TABLET), { device: 'Tablet', browser: 'Chrome', os: 'Android' });
  assert.equal(parseUserAgent(EDGE).browser, 'Edge');
});

test('bots and tools are not visitors', () => {
  for (const ua of ['Googlebot/2.1', 'Mozilla/5.0 HeadlessChrome/130', 'curl/8.4', 'python-requests/2.31', 'facebookexternalhit/1.1', '']) {
    assert.equal(isBot(ua), true, ua);
  }
  assert.equal(isBot(CHROME_WIN), false);
});

test('visits: valid report becomes a document', () => {
  const v = buildVisit({ v: 'abc12345-visitor', s: 'sess-12345678', n: true, p: 'jobs', r: 'https://www.google.com/search?q=x', u: 'LinkedIn!' },
    { userAgent: SAFARI_IPHONE, origin: 'https://internship-finder-tau.vercel.app' });
  assert.equal(v.page, 'jobs');
  assert.equal(v.newVisitor, true);
  assert.equal(v.referrer, 'google.com');
  assert.equal(v.utmSource, 'linkedin');
  assert.equal(v.device, 'Mobile');
  assert.ok(v.at instanceof Date);
  assert.equal('ip' in v, false);
});

test('visits: rejected when malformed, a bot, or from localhost', () => {
  const ok = { v: 'abc12345-visitor', s: 'sess-12345678', p: 'landing' };
  const site = { userAgent: CHROME_WIN, origin: 'https://internship-finder-tau.vercel.app' };
  assert.equal(buildVisit({ ...ok, p: 'secret-page' }, site), null);
  assert.equal(buildVisit({ ...ok, v: 'x' }, site), null);
  assert.equal(buildVisit({ ...ok, v: '<script>alert(1)</script>' }, site), null);
  assert.equal(buildVisit(null, site), null);
  assert.equal(buildVisit(ok, { ...site, userAgent: 'Googlebot' }), null);
  assert.equal(buildVisit(ok, { ...site, origin: 'http://localhost:5173' }), null);
  assert.equal(buildVisit(ok, { ...site, origin: 'http://app.localhost:4317' }), null);
  assert.notEqual(buildVisit(ok, { ...site, origin: 'http://localhost:5173', recordLocal: true }), null);
});

test('visits: moving within the site is not a referrer', () => {
  const v = buildVisit({ v: 'abc12345-visitor', s: 'sess-12345678', p: 'jobs', r: 'https://internship-finder-tau.vercel.app/' },
    { userAgent: CHROME_WIN, origin: 'https://internship-finder-tau.vercel.app' });
  assert.equal(v.referrer, '');
  assert.equal(hostOf('javascript:alert(1)'), '');
});

test('IST days: midnight boundaries and the day list', () => {
  // 20:00 UTC on 10 Nov is 01:30 on 11 Nov in India
  const now = new Date('2026-11-10T20:00:00Z');
  assert.equal(istDay(now), '2026-11-11');
  assert.equal(istMidnight(0, now).toISOString(), '2026-11-10T18:30:00.000Z');
  assert.equal(istMidnight(1, now).toISOString(), '2026-11-09T18:30:00.000Z');
  assert.deepEqual(dayList(3, now), ['2026-11-09', '2026-11-10', '2026-11-11']);
});

test('CSV: quoting and formula injection', () => {
  const csv = toCsv(['email', 'name'], [['a@b.co', 'Ann, "A"'], ['=HYPERLINK("x")', '+1'], [null, new Date('2026-01-02T00:00:00Z')]]);
  assert.equal(csv, 'email,name\r\na@b.co,"Ann, ""A"""\r\n"\'=HYPERLINK(""x"")",\'+1\r\n,2026-01-02T00:00:00.000Z\r\n');
});
