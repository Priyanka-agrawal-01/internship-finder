const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Regular expression for email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/subscribe
 * Validates subscriber email and dispatches welcome message.
 */
router.post('/', async (req, res) => {
  const { email } = req.body;

  // 1. Validate request body
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required.'
    });
  }

  // 2. Validate email structure
  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  try {
    // 3. Dispatch confirmation email
    const result = await emailService.sendSubscriptionEmail(email.trim());

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed! Check your inbox for a confirmation email.',
      previewUrl: result.previewUrl || null // Shared if running with ethereal.email
    });
  } catch (error) {
    console.error('Subscription error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to complete subscription. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
