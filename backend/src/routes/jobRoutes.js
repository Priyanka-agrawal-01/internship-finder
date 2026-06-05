const express = require('express');
const router = express.Router();
const jobService = require('../services/jobService');

/**
 * GET /api/jobs
 * Returns a list of normalized job postings from aggregated public sources.
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await jobService.getJobs();
    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Error fetching jobs in route:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
