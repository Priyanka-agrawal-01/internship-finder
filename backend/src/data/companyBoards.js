'use strict';
/**
 * Companies whose own careers pages run on a public job-board platform, and that
 * had openings in India when this list was checked (10 Nov 2026). Only their
 * Indian openings enter the feed. No keys are needed: these are the same public
 * endpoints the companies' own careers pages read.
 *
 *   greenhouse       https://boards-api.greenhouse.io/v1/boards/<slug>/jobs
 *   lever            https://api.lever.co/v0/postings/<slug>?mode=json
 *   ashby            https://api.ashbyhq.com/posting-api/job-board/<slug>
 *   smartrecruiters  https://api.smartrecruiters.com/v1/companies/<slug>/postings?country=in
 *
 * To add a company, find its careers page's platform and slug (the part of the
 * job-board address after the platform's domain) and add a line. A board that
 * stops answering just contributes nothing; the feed log names it.
 */
module.exports = [
  // Indian companies
  { name: 'Paytm',            platform: 'lever',           slug: 'paytm' },
  { name: 'Swiggy',           platform: 'smartrecruiters', slug: 'Swiggy' },
  { name: 'Meesho',           platform: 'lever',           slug: 'meesho' },
  { name: 'Razorpay',         platform: 'greenhouse',      slug: 'razorpaysoftwareprivatelimited' },
  { name: 'Freshworks',       platform: 'smartrecruiters', slug: 'Freshworks' },
  { name: 'Groww',            platform: 'greenhouse',      slug: 'groww' },
  { name: 'CRED',             platform: 'lever',           slug: 'cred' },
  { name: 'Zeta',             platform: 'lever',           slug: 'zeta' },
  { name: 'InMobi',           platform: 'greenhouse',      slug: 'inmobi' },
  { name: 'HighRadius',       platform: 'greenhouse',      slug: 'highradius' },
  { name: 'Zenoti',           platform: 'greenhouse',      slug: 'zenoti' },
  { name: 'Mindtickle',       platform: 'lever',           slug: 'mindtickle' },
  { name: 'HackerRank',       platform: 'greenhouse',      slug: 'hackerrank' },
  { name: 'FamPay',           platform: 'lever',           slug: 'fampay' },
  { name: 'Druva',            platform: 'greenhouse',      slug: 'druva' },
  { name: 'Observe.AI',       platform: 'greenhouse',      slug: 'observeai' },
  { name: 'Sarvam AI',        platform: 'ashby',           slug: 'sarvam' },
  { name: 'Atlan',            platform: 'ashby',           slug: 'atlan' },
  { name: 'Composio',         platform: 'ashby',           slug: 'composio' },
  { name: 'Smallest.ai',      platform: 'ashby',           slug: 'smallest' },
  { name: 'Pocket FM',        platform: 'lever',           slug: 'pocketfm' },

  // Global companies with Indian offices
  { name: 'Bosch',            platform: 'smartrecruiters', slug: 'BoschGroup' },
  { name: 'ServiceNow',       platform: 'smartrecruiters', slug: 'ServiceNow' },
  { name: 'NielsenIQ',        platform: 'smartrecruiters', slug: 'NielsenIQ' },
  { name: 'Experian',         platform: 'smartrecruiters', slug: 'Experian' },
  { name: 'Continental',      platform: 'smartrecruiters', slug: 'Continental' },
  { name: 'Western Digital',  platform: 'smartrecruiters', slug: 'WesternDigital' },
  { name: 'Okta',             platform: 'greenhouse',      slug: 'okta' },
  { name: 'Zscaler',          platform: 'greenhouse',      slug: 'zscaler' },
  { name: 'Databricks',       platform: 'greenhouse',      slug: 'databricks' },
  { name: 'MongoDB',          platform: 'greenhouse',      slug: 'mongodb' },
  { name: 'Stripe',           platform: 'greenhouse',      slug: 'stripe' },
  { name: 'GitLab',           platform: 'greenhouse',      slug: 'gitlab' },
  { name: 'Rubrik',           platform: 'greenhouse',      slug: 'rubrik' },
  { name: 'Fivetran',         platform: 'greenhouse',      slug: 'fivetran' },
  { name: 'Elastic',          platform: 'greenhouse',      slug: 'elastic' },
  { name: 'Twilio',           platform: 'greenhouse',      slug: 'twilio' },
  { name: 'Coinbase',         platform: 'greenhouse',      slug: 'coinbase' },
  { name: 'Airbnb',           platform: 'greenhouse',      slug: 'airbnb' },
  { name: 'Datadog',          platform: 'greenhouse',      slug: 'datadog' },
  { name: 'Samsara',          platform: 'greenhouse',      slug: 'samsara' },
  { name: 'OpenAI',           platform: 'ashby',           slug: 'openai' },
  { name: 'Notion',           platform: 'ashby',           slug: 'notion' },
  { name: 'Spotify',          platform: 'lever',           slug: 'spotify' },
];
