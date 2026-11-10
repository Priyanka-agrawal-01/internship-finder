'use strict';

// ─────────────────────────────────────────────────────────────────────────────
//  PREFERENCE MATCHING  (pure functions — no DB, no network)
//  Decides whether a job satisfies a subscriber's alert preferences.
// ─────────────────────────────────────────────────────────────────────────────

// Known ECE companies (mirrors companiesData.js categories)
const ECE_COMPANIES = [
  'Qualcomm','Intel','AMD','Cadence','Synopsys','Broadcom',
  'Texas Instruments','Marvell','MediaTek','Nokia','Ericsson',
  'Samsung Semiconductors','Micron Technology','NXP Semiconductors',
  'STMicroelectronics','Infineon Technologies','Renesas','Keysight Technologies',
  'National Instruments','Analog Devices','Lam Research','Applied Materials',
  'ASML','NVIDIA','ARM Holdings','Bosch','Siemens','Honeywell','Rockwell Automation',
  'ABB','Emerson','Schneider Electric','GE Digital','L&T Technology Services',
  'Tata Elxsi','KPIT Technologies','Continental','Harman','Visteon','Aptiv',
  'Mphasis','Zensar Technologies','Cyient','LTTS',
];

const PRODUCT_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Adobe', 'Flipkart', 'Cisco', 'NVIDIA', 'Atlassian', 'PayPal',
  'Samsung', 'Oracle', 'Salesforce', 'Intuit', 'ServiceNow', 'VMware', 'Walmart', 'Uber', 'LinkedIn', 'DE Shaw',
];

const STARTUPS = ['Razorpay', 'Zomato', 'Swiggy', 'Paytm', 'Meesho', 'PhonePe', 'Cred', 'Groww'];

const EUROPE = [
  'germany', 'united kingdom', 'uk', 'france', 'netherlands', 'poland', 'ireland', 'sweden',
  'switzerland', 'spain', 'italy', 'austria', 'belgium', 'denmark', 'finland', 'norway', 'portugal',
];

// Role keywords. Matched as whole words, so "ai" does not match "trainee" or
// "email", "ml" does not match "html", and "java" does not match "javascript".
const ROLE_KEYWORDS = {
  aiMlRoles: [
    'ai', 'ml', 'ai/ml', 'machine learning', 'deep learning', 'nlp', 'llm', 'genai', 'generative ai',
    'data science', 'data scientist', 'computer vision', 'artificial intelligence',
  ],
  frontendRoles: [
    'frontend', 'front-end', 'front end', 'react', 'reactjs', 'react.js', 'next.js', 'nextjs',
    'vue', 'vuejs', 'angular', 'html', 'css', 'ui', 'ux', 'web developer', 'web development', 'web dev',
  ],
  backendRoles: [
    'backend', 'back-end', 'back end', 'node', 'nodejs', 'node.js', 'express', 'django',
    'spring boot', 'springboot', 'flask', 'fastapi', 'golang', 'java', 'c#', '.net', 'asp.net',
    'sql', 'python', 'api', 'apis', 'rest api', 'restful', 'microservices',
  ],
  vlsiRoles: [
    'vlsi', 'rtl', 'verilog', 'systemverilog', 'asic', 'fpga', 'uvm', 'soc', 'logic synthesis',
    'design verification', 'physical design', 'ic design', 'analog design', 'digital design',
  ],
  embeddedRoles: [
    'embedded', 'firmware', 'microcontroller', 'mcu', 'iot', 'rtos', 'arduino', 'raspberry pi',
    'stm32', 'device driver', 'device drivers',
  ],
};

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Build a case-insensitive regex that matches any keyword as a whole word. */
function wordRegex(keywords) {
  return new RegExp(`(?:^|[^a-z0-9])(?:${keywords.map(escapeRegExp).join('|')})(?=$|[^a-z0-9])`, 'i');
}

const ROLE_REGEX   = Object.fromEntries(Object.entries(ROLE_KEYWORDS).map(([k, v]) => [k, wordRegex(v)]));
const US_REGEX     = wordRegex(['united states', 'usa', 'us']);
const EUROPE_REGEX = wordRegex(EUROPE);
const INDIA_REGEX  = wordRegex(['india']);
const REMOTE_REGEX = wordRegex(['remote']);

function containsKeywords(text, keywords) {
  if (!text) return false;
  return wordRegex(keywords).test(text);
}

/** "NVIDIA Corporation" and "Google LLC" should still count as NVIDIA / Google. */
function companyIn(company = '', names) {
  const c = company.trim().toLowerCase();
  return names.some(n => {
    const name = n.toLowerCase();
    return c === name || c.startsWith(name + ' ') || c.startsWith(name + ',');
  });
}

function isRemoteJob(job) {
  return job.workMode === 'Remote' || job.isRemote === true || REMOTE_REGEX.test(job.location || '');
}

function locationMatches(job, loc) {
  const country = (job.country || '').toLowerCase();
  const where   = job.location || '';
  const isIndia  = country === 'india' || INDIA_REGEX.test(where);
  const isUS     = country === 'united states' || US_REGEX.test(where);
  const isEurope = EUROPE.includes(country) || EUROPE_REGEX.test(where);

  switch (loc) {
    case 'India':           return isIndia;
    case 'Remote':          return isRemoteJob(job);
    case 'United States':   return isUS;
    case 'Europe':          return isEurope;
    case 'Other Countries': return !isIndia && !isUS && !isEurope;
    default:                return false;
  }
}

function jobMatchesPreferences(job, prefs = {}) {
  const {
    itCompanies       = false,
    eceCompanies      = false,
    remoteInternships = false,
    productCompanies  = false,
    startups          = false,
    locations         = [],
    internshipsOnly   = true,
  } = prefs;

  // 1. Internship filter
  if (internshipsOnly && !job.isInternship) return false;

  // 2. IT / ECE company filter — only applies when exactly one of the two is selected
  const isECE = companyIn(job.company, ECE_COMPANIES);
  if (itCompanies !== eceCompanies) {
    if (itCompanies && isECE) return false;
    if (eceCompanies && !isECE) return false;
  }

  // 3. Remote internships
  if (remoteInternships && !isRemoteJob(job)) return false;

  // 4. Product companies
  if (productCompanies && !companyIn(job.company, PRODUCT_COMPANIES)) return false;

  // 5. Startups
  if (startups) {
    const isStartupSource = /remotive|wellfound/i.test(job.source || '');
    if (!companyIn(job.company, STARTUPS) && !isStartupSource) return false;
  }

  // 6. Role filters — the job must match at least one selected role
  const selectedRoles = Object.keys(ROLE_REGEX).filter(k => prefs[k] === true);
  if (selectedRoles.length > 0) {
    const titleAndTags = `${job.title || ''} ${(job.tags || []).join(' ')}`;
    if (!selectedRoles.some(k => ROLE_REGEX[k].test(titleAndTags))) return false;
  }

  // 7. Locations — the job must match at least one selected location
  if (Array.isArray(locations) && locations.length > 0) {
    if (!locations.some(loc => locationMatches(job, loc))) return false;
  }

  return true;
}

const ALLOWED_LOCATIONS = ['India', 'Remote', 'United States', 'Europe', 'Other Countries'];

module.exports = {
  jobMatchesPreferences,
  containsKeywords,
  companyIn,
  ECE_COMPANIES,
  ALLOWED_LOCATIONS,
};
