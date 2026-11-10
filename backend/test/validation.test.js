'use strict';
const test   = require('node:test');
const assert = require('node:assert/strict');
const { normalizeEmail, sanitizePreferences } = require('../src/utils/preferences');
const { escapeHtml, safeUrl } = require('../src/utils/html');

test('sanitizePreferences never throws on bad input', () => {
  for (const bad of [null, undefined, 'x', 42, [], [1, 2]]) {
    const p = sanitizePreferences(bad);
    assert.equal(p.frequency, '6hours');
    assert.equal(p.itCompanies, false);
    assert.deepEqual(p.locations, []);
    assert.equal(p.internshipsOnly, true);
  }
});

test('sanitizePreferences keeps only known values', () => {
  const p = sanitizePreferences({
    itCompanies: true,
    aiMlRoles: 'yes',                       // not a boolean → false
    frequency: 'every-minute',              // unknown → default
    locations: ['India', 'Mars', 'India', { $gt: '' }],
    companies: ['Google', 7, '  ', 'x'.repeat(500)],
  });
  assert.equal(p.itCompanies, true);
  assert.equal(p.aiMlRoles, false);
  assert.equal(p.frequency, '6hours');
  assert.deepEqual(p.locations, ['India']);
  assert.equal(p.companies.length, 2);
  assert.equal(p.companies[1].length, 60);
});

test('normalizeEmail', () => {
  assert.equal(normalizeEmail('  Foo@Example.COM '), 'foo@example.com');
  assert.equal(normalizeEmail('not-an-email'), null);
  assert.equal(normalizeEmail(['a@b.co']), null);
  assert.equal(normalizeEmail(null), null);
  assert.equal(normalizeEmail(`${'a'.repeat(250)}@b.co`), null);
  assert.equal(normalizeEmail('first.last+tag@sub.example.co.in'), 'first.last+tag@sub.example.co.in');
  assert.equal(normalizeEmail('user@xn--80ak6aa92e.xn--p1ai'), 'user@xn--80ak6aa92e.xn--p1ai');
});

test('normalizeEmail rejects addresses that could confuse a mail parser', () => {
  for (const tricky of [
    '"a>b"@evil.com',
    'victim@example.com>@evil.com',
    'a;b@example.com',
    'a,b@example.com',
    'a(comment)@example.com',
    'a..b@example.com',
    '.a@example.com',
    'a@-example.com',
    'a@example',
  ]) {
    assert.equal(normalizeEmail(tricky), null, tricky);
  }
});

test('escapeHtml escapes markup and quotes', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapeHtml(null), '');
});

test('safeUrl only allows http(s)', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '#');
  assert.equal(safeUrl('data:text/html,hi'), '#');
  assert.equal(safeUrl('not a url'), '#');
  assert.equal(safeUrl('https://example.com/a?b=1&c=2'), 'https://example.com/a?b=1&amp;c=2');
});
