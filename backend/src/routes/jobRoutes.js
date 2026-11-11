'use strict';
const express = require('express');
const router  = express.Router();
const { getJobs, getCacheStatus, forceRefresh } = require('../services/jobService');
const { requireAdmin, asyncHandler } = require('../middleware/security');

/**
 * GET /api/jobs
 * Returns live listings from companies' careers pages and job boards (see
 * services/jobService.js), Indian jobs first. Every job comes from a real API source.
 */
router.get('/', asyncHandler(async (req, res) => {
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
}));

/**
 * GET /api/jobs/status
 * Returns cache health metadata.
 */
router.get('/status', (req, res) => {
  res.json({ success: true, ...getCacheStatus() });
});

/**
 * POST /api/jobs/refresh  (admin — needs x-admin-token)
 * Forces a fresh multi-source fetch. Protected because each refresh makes
 * dozens of upstream API calls that count against rate limits and quotas.
 */
router.post('/refresh', requireAdmin, asyncHandler(async (req, res) => {
  const jobs = await forceRefresh();
  res.json({
    success:   true,
    message:   `Cache refreshed — ${jobs.length} live jobs fetched from APIs.`,
    count:     jobs.length,
    fetchedAt: new Date().toISOString(),
    sources:   getCacheStatus(),
  });
}));

module.exports = router;
