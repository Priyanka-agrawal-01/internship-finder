'use strict';
const test   = require('node:test');
const assert = require('node:assert/strict');
const { jobMatchesPreferences, companyIn, ECE_COMPANIES } = require('../src/services/jobMatcher');

const intern = (overrides = {}) => ({
  title: 'Intern', company: 'Acme', location: 'Remote', tags: [], isInternship: true, ...overrides,
});

test('role keywords match whole words only', async t => {
  await t.test('"ai" does not match "trainee" or "email"', () => {
    const job = intern({ title: 'Trainee Accountant', tags: ['email', 'maintenance'] });
    assert.equal(jobMatchesPreferences(job, { aiMlRoles: true }), false);
  });
  await t.test('"AI" and "ML" match as words', () => {
    assert.equal(jobMatchesPreferences(intern({ title: 'AI/ML Engineering Intern' }), { aiMlRoles: true }), true);
    assert.equal(jobMatchesPreferences(intern({ title: 'Machine Learning Intern' }), { aiMlRoles: true }), true);
  });
  await t.test('"ml" does not match "html"', () => {
    assert.equal(jobMatchesPreferences(intern({ title: 'HTML Email Developer' }), { aiMlRoles: true }), false);
  });
  await t.test('"ui" does not match "build"', () => {
    assert.equal(jobMatchesPreferences(intern({ title: 'Build Engineer Intern' }), { frontendRoles: true }), false);
    assert.equal(jobMatchesPreferences(intern({ title: 'UI/UX Design Intern' }), { frontendRoles: true }), true);
  });
  await t.test('"java" does not match "javascript"', () => {
    assert.equal(jobMatchesPreferences(intern({ title: 'JavaScript Intern' }), { backendRoles: true }), false);
    assert.equal(jobMatchesPreferences(intern({ title: 'Java Backend Intern' }), { backendRoles: true }), true);
  });
  await t.test('"Spring" in a season name is not a backend role', () => {
    assert.equal(jobMatchesPreferences(intern({ title: 'Spring 2027 Marketing Intern' }), { backendRoles: true }), false);
  });
  await t.test('punctuated keywords like c# and node.js work', () => {
    assert.equal(jobMatchesPreferences(intern({ title: 'C# Developer Intern' }), { backendRoles: true }), true);
    assert.equal(jobMatchesPreferences(intern({ tags: ['Node.js'] }), { backendRoles: true }), true);
  });
});

test('internshipsOnly is on by default', () => {
  assert.equal(jobMatchesPreferences(intern({ isInternship: false }), {}), false);
  assert.equal(jobMatchesPreferences(intern({ isInternship: false }), { internshipsOnly: false }), true);
});

test('location matching uses whole words', async t => {
  await t.test('"Milwaukee" is not Europe even though it contains "uk"', () => {
    assert.equal(jobMatchesPreferences(intern({ location: 'Milwaukee, WI' }), { locations: ['Europe'] }), false);
  });
  await t.test('"London, UK" is Europe', () => {
    assert.equal(jobMatchesPreferences(intern({ location: 'London, UK' }), { locations: ['Europe'] }), true);
  });
  await t.test('"Remote, US" is United States', () => {
    assert.equal(jobMatchesPreferences(intern({ location: 'Remote, US' }), { locations: ['United States'] }), true);
  });
  await t.test('"Austin, Texas" via country field is United States', () => {
    assert.equal(jobMatchesPreferences(intern({ location: 'Austin', country: 'United States' }), { locations: ['United States'] }), true);
  });
  await t.test('Other Countries excludes India/US/Europe', () => {
    assert.equal(jobMatchesPreferences(intern({ location: 'Singapore' }), { locations: ['Other Countries'] }), true);
    assert.equal(jobMatchesPreferences(intern({ location: 'Bengaluru, India' }), { locations: ['Other Countries'] }), false);
  });
});

test('company lists tolerate legal suffixes', () => {
  assert.equal(companyIn('NVIDIA Corporation', ECE_COMPANIES), true);
  assert.equal(companyIn('Intel', ECE_COMPANIES), true);
  assert.equal(companyIn('Intellect Design', ECE_COMPANIES), false);
});

test('IT / ECE filters', () => {
  const ece = intern({ company: 'Qualcomm India Pvt Ltd' });
  const it  = intern({ company: 'Swiggy' });
  assert.equal(jobMatchesPreferences(ece, { eceCompanies: true }), true);
  assert.equal(jobMatchesPreferences(it,  { eceCompanies: true }), false);
  assert.equal(jobMatchesPreferences(ece, { itCompanies: true }), false);
  assert.equal(jobMatchesPreferences(it,  { itCompanies: true }), true);
  assert.equal(jobMatchesPreferences(ece, { itCompanies: true, eceCompanies: true }), true);
});
