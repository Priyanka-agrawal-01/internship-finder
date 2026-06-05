const nodemailer = require('nodemailer');

// Cache the transporter globally to avoid recreating it on every request
let transporterInstance = null;
let testAccountCredentials = null;

/**
 * Get the Nodemailer transporter instance, initializing it if necessary.
 * Support standard SMTP config from env or ethereal.email fallback for local testing.
 */
async function getTransporter() {
  if (transporterInstance) {
    return { transporter: transporterInstance, testCredentials: testAccountCredentials };
  }

  const hasEnvCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (hasEnvCredentials) {
    console.log('Configuring Nodemailer with environment credentials...');
    transporterInstance = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    console.log('No email environment variables found. Generating Ethereal test mail account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      testAccountCredentials = testAccount;
      transporterInstance = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`\n=============================================================`);
      console.log(`Ethereal Test Account Details:`);
      console.log(`User: ${testAccount.user}`);
      console.log(`Pass: ${testAccount.pass}`);
      console.log(`View emails sent here at: https://ethereal.email/login`);
      console.log(`=============================================================\n`);
    } catch (error) {
      console.error('Failed to create Ethereal test email account, falling back to console logger:', error.message);
      
      // Fallback dummy transporter so subscription route never crashes
      transporterInstance = {
        sendMail: async (options) => {
          console.log('\n--- DUMMY EMAIL DISPATCH (NO SMTP CREDENTIALS AVAILABLE) ---');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Text: ${options.text}`);
          console.log(`------------------------------------------------------------\n`);
          return { messageId: `dummy-id-${Date.now()}` };
        }
      };
    }
  }

  return { transporter: transporterInstance, testCredentials: testAccountCredentials };
}

module.exports = { getTransporter };
