const nodemailer = require('nodemailer');
const { getTransporter } = require('../config/mail');

/**
 * Sends a welcome subscription confirmation email.
 * @param {string} recipientEmail - Email address of the subscriber.
 */
async function sendSubscriptionEmail(recipientEmail) {
  if (!recipientEmail) {
    throw new Error('Recipient email is required.');
  }

  const { transporter, testCredentials } = await getTransporter();

  const mailOptions = {
    from: `"InternPulse Team" <no-reply@internpulse.co>`,
    to: recipientEmail,
    subject: 'Welcome to InternPulse! 🚀 Your Internship Tracker',
    text: `Hi there! Thank you for subscribing to InternPulse. We will notify you as soon as new internship and job postings match your filters. Happy hunting!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Intern<span style="color: #10b981;">Pulse</span></h1>
          <p style="color: #718096; margin: 5px 0 0 0; font-size: 14px;">Your Gateway to the Best Internship & Remote Job Opportunities</p>
        </div>
        
        <h2 style="color: #2d3748; font-size: 20px; font-weight: 600; margin-top: 0;">Subscription Confirmed! 🎉</h2>
        
        <p style="line-height: 1.6; color: #4a5568; font-size: 16px;">
          Thank you for subscribing to <strong>InternPulse</strong>. You have joined a community of ambitious job seekers finding real-time, aggregated internships and remote positions.
        </p>

        <p style="line-height: 1.6; color: #4a5568; font-size: 16px;">
          <strong>What's next?</strong>
        </p>
        <ul style="padding-left: 20px; line-height: 1.6; color: #4a5568; font-size: 15px;">
          <li>Receive daily/weekly updates on high-quality student and junior roles.</li>
          <li>Access filtered opportunities from premium remote networks.</li>
          <li>Apply immediately using normalized direct application links.</li>
        </ul>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">
            Explore Job Dashboard
          </a>
        </div>

        <p style="line-height: 1.6; color: #718096; font-size: 14px; border-top: 1px solid #edf2f7; padding-top: 20px; margin-top: 30px; text-align: center;">
          Happy job hunting!<br>
          <strong>The InternPulse Team</strong>
        </p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email successfully sent to ${recipientEmail}. Message ID: ${info.messageId}`);

  // If using Ethereal test account, output the URL to view the message in the browser
  if (testCredentials) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n------------------------------------------------------------`);
    console.log(`📬 View Ethereal Email Preview: ${previewUrl}`);
    console.log(`------------------------------------------------------------\n`);
    return { success: true, messageId: info.messageId, previewUrl };
  }

  return { success: true, messageId: info.messageId };
}

module.exports = {
  sendSubscriptionEmail
};
