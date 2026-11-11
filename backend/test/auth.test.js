'use strict';
const test   = require('node:test');
const assert = require('node:assert/strict');

const { hashPassword, verifyPassword, passwordProblem, DUMMY_HASH } = require('../src/utils/passwords');
const { readBearer, hashToken, newToken } = require('../src/middleware/auth');
const { sanitizeItemData, sanitizeImportItem, cleanItemId, cleanKind } = require('../src/utils/savedItems');
const { cycleKey } = require('../src/services/alertService');

test('passwords: hash, verify, reject wrong and malformed', async () => {
  const stored = await hashPassword('correct horse battery');
  assert.match(stored, /^scrypt\$16384\$8\$1\$/);
  assert.equal(await verifyPassword('correct horse battery', stored), true);
  assert.equal(await verifyPassword('correct horse batterY', stored), false);
  assert.equal(await verifyPassword('anything', DUMMY_HASH), false);
  assert.equal(await verifyPassword('anything', ''), false);
  assert.equal(await verifyPassword('anything', 'scrypt$x$y$z$a$b'), false);
  // two hashes of one password differ (random salt)
  assert.notEqual(await hashPassword('same password'), await hashPassword('same password'));
});

test('passwords: composed and decomposed accents match', async () => {
  const stored = await hashPassword('café-password');
  assert.equal(await verifyPassword('café-password', stored), true);
});

test('password rules', () => {
  assert.match(passwordProblem('short'), /at least 8/);
  assert.match(passwordProblem('x'.repeat(129)), /at most 128/);
  assert.match(passwordProblem('        '), /only spaces/);
  assert.equal(passwordProblem(undefined) !== null, true);
  assert.equal(passwordProblem('long enough'), null);
});

test('session tokens: bearer parsing and hashing', () => {
  const token = newToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  const req = h => ({ get: name => (name === 'authorization' ? h : undefined) });
  assert.equal(readBearer(req(`Bearer ${token}`)), token);
  assert.equal(readBearer(req(`bearer ${token}`)), null);
  assert.equal(readBearer(req('Bearer short')), null);
  assert.equal(readBearer(req(undefined)), null);
  assert.equal(hashToken(token).length, 64);
  assert.notEqual(hashToken(token), token);
});

test('saved items: ids and kinds', () => {
  assert.equal(cleanKind('job'), 'job');
  assert.equal(cleanKind('admin'), null);
  assert.equal(cleanItemId('  jsearch-abc==/+  '), 'jsearch-abc==/+');
  assert.equal(cleanItemId('x'.repeat(513)), null);
  assert.equal(cleanItemId(''), null);
  assert.equal(cleanItemId({}), null);
});

test('saved items: job data keeps only known fields, safe links', () => {
  const d = sanitizeItemData('job', {
    title: 'ML Intern', company: 'Acme', workMode: 'Remote', isInternship: true,
    url: 'javascript:alert(1)', logoUrl: 'https://logo.example/a.png',
    tags: ['python', 42, 'ml'], postedAt: '2026-11-01T10:00:00Z', password: 'nope', __proto__: { x: 1 },
  });
  assert.equal(d.title, 'ML Intern');
  assert.equal(d.url, '');
  assert.equal(d.logoUrl, 'https://logo.example/a.png');
  assert.deepEqual(d.tags, ['python', 'ml']);
  assert.equal(d.workMode, 'Remote');
  assert.equal(d.postedAt.toISOString(), '2026-11-01T10:00:00.000Z');
  assert.equal('password' in d, false);
  assert.equal(sanitizeItemData('job', { workMode: 'Moon' }).workMode, '');
  assert.equal(sanitizeItemData('job', { postedAt: '1970-01-01' }).postedAt, null);
});

test('saved items: company data', () => {
  const d = sanitizeItemData('company', { name: 'NVIDIA', category: ['Hardware'], location: 'Pune', careers: 'https://nvidia.com/careers', color: '#76B900', tab: 'ece' });
  assert.deepEqual(d, { name: 'NVIDIA', category: ['Hardware'], location: ['Pune'], stipend: '', url: 'https://nvidia.com/careers', color: '#76B900', tab: 'ece' });
});

test('saved items: import entries', () => {
  assert.equal(sanitizeImportItem({ kind: 'job', itemId: 'a' }), null);         // neither flag
  assert.equal(sanitizeImportItem({ kind: 'x', itemId: 'a', bookmarked: true }), null);
  assert.equal(sanitizeImportItem(null), null);
  const it = sanitizeImportItem({ kind: 'job', itemId: 'remotive-1', applied: true, appliedAt: '2026-11-02T00:00:00Z', data: { title: 'T' } });
  assert.equal(it.applied, true);
  assert.equal(it.bookmarked, false);
  assert.equal(it.bookmarkedAt, null);
  assert.equal(it.appliedAt.toISOString(), '2026-11-02T00:00:00.000Z');
  assert.equal(it.data.title, 'T');
});

test('alert cycles are keyed by UTC hour', () => {
  assert.equal(cycleKey(new Date('2026-11-10T19:00:03Z')), '2026-11-10T19');
  assert.equal(cycleKey(new Date('2026-11-10T19:59:59Z')), '2026-11-10T19');
  assert.notEqual(cycleKey(new Date('2026-11-10T20:00:00Z')), '2026-11-10T19');
});
