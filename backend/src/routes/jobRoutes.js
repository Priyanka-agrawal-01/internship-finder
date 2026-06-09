'use strict';
const express = require('express');
const router  = express.Router();
const { getJobs, getCacheStatus, forceRefresh } = require('../services/jobService');

/**
 * GET /api/jobs
 * Returns live internship listings aggregated from Remotive, Arbeitnow,
 * Adzuna, JSearch, and The Muse. No hardcoded or curated jobs are injected.
 * Every job comes from a real API source.
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await getJobs();
    res.json({
      success:     true,
      count:       jobs.length,
      fetchedAt:   new Date().toISOString(),
      cacheStatus: getCacheStatus(),
      jobs,
    });
  } catch (error) {
    console.error('[/api/jobs] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs. Please try again later.',
      error:   process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/jobs/status
 * Returns cache health metadata.
 */
router.get('/status', (req, res) => {
  res.json({ success: true, ...getCacheStatus() });
});

/**
 * POST /api/jobs/refresh
 * Force-invalidates the cache and triggers a fresh multi-source fetch.
 */
router.post('/refresh', async (req, res) => {
  try {
    forceRefresh();                       // invalidate cache
    const jobs = await getJobs();         // trigger fresh fetch
    res.json({
      success:   true,
      message:   `Cache refreshed — ${jobs.length} live jobs fetched from APIs.`,
      count:     jobs.length,
      fetchedAt: new Date().toISOString(),
      sources:   getCacheStatus(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
