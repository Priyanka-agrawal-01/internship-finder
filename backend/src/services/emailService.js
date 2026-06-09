'use strict';
const nodemailer = require('nodemailer');
const { getTransporter } = require('../config/mail');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:5000';
const FROM_ADDRESS = process.env.EMAIL_FROM   || '"InternPulse Alerts" <alerts@internpulse.dev>';

// Maximum time (ms) to wait for transporter.sendMail to complete
const SEND_TIMEOUT_MS = 12000;

// ─────────────────────────────────────────────────────────────────────────────
//  TIMEOUT WRAPPER  — ensures email sending never hangs forever
// ─────────────────────────────────────────────────────────────────────────────
function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED EMAIL LAYOUT
// ─────────────────────────────────────────────────────────────────────────────
function wrapLayout(bodyHtml, preheader = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <title>InternPulse</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1D4ED8 0%,#2563EB 100%);padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td align="left">
                <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                  Intern<span style="color:#93C5FD;">Pulse</span>
                </span>
                <span style="font-size:11px;color:#BFDBFE;margin-left:10px;vertical-align:middle;">
                  Real-time Internship Alerts
                </span>
              </td>
              <td align="right">
                <span style="background:#1D4ED8;color:#93C5FD;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid #3B82F6;">
                  🌍 Worldwide + India
                </span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- BODY -->
        <tr><td style="padding:32px;">
          ${bodyHtml}
        </td></tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;">
              © ${new Date().getFullYear()} InternPulse · Built for students
            </p>
            <p style="margin:0;font-size:12px;color:#94A3B8;">
              You're receiving this because you subscribed at
              <a href="${FRONTEND_URL}" style="color:#2563EB;text-decoration:none;">internpulse.dev</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AVATAR LOGO FOR JOB CARDS IN EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#EFF6FF','#2563EB'],['#F0FDF4','#16A34A'],['#FFF7ED','#EA580C'],
  ['#FDF4FF','#9333EA'],['#FFF1F2','#E11D48'],['#ECFDF5','#059669'],
];
function logoHtml(company = '') {
  const [bg, fg] = AVATAR_COLORS[(company.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const initials = (company || '??').slice(0, 2).toUpperCase();
  return `<div style="width:52px;height:52px;border-radius:12px;background:${bg};color:${fg};font-size:18px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;border:1px solid ${fg}30;text-align:center;line-height:52px;">${initials}</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  JOB CARD HTML (used in alert emails)
// ─────────────────────────────────────────────────────────────────────────────
function jobCardHtml(job) {
  const stipendBadge = job.stipend
    ? `<span style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">💰 ${job.stipend}</span>`
    : '';
  const locationBadge = `<span style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;">📍 ${job.location || 'India'}</span>`;
  const sourceBadge   = `<span style="background:#F8FAFC;color:#64748B;border:1px solid #E2E8F0;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;">${job.source || 'InternPulse'}</span>`;
  const internBadge   = job.isInternship ? `<span style="background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">🎓 Internship</span>` : '';
  const tagsHtml = (job.tags || []).slice(0, 4)
    .map(t => `<span style="background:#F1F5F9;color:#475569;border-radius:6px;padding:3px 8px;font-size:11px;margin:2px;">${t}</span>`)
    .join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#FAFBFD;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:16px;">
    <tr><td style="padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="60" valign="top">${logoHtml(job.company)}</td>
        <td style="padding-left:14px;" valign="top">
          <div style="font-size:16px;font-weight:700;color:#0F172A;line-height:1.3;margin-bottom:3px;">${job.title}</div>
          <div style="font-size:13px;color:#64748B;font-weight:500;">${job.company}</div>
        </td>
      </tr></table>
      <div style="margin-top:14px;">${internBadge} ${stipendBadge} ${locationBadge} ${sourceBadge}</div>
      ${tagsHtml ? `<div style="margin-top:10px;">${tagsHtml}</div>` : ''}
      <div style="margin-top:18px;">
        <a href="${job.url}" target="_blank"
          style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:700;">
          Apply Now →
        </a>
        <span style="font-size:11px;color:#94A3B8;margin-left:12px;">
          ${job.postedAt ? `Posted ${new Date(job.postedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}` : 'Recently posted'}
        </span>
      </div>
    </td></tr>
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  WELCOME EMAIL  — professional, fully branded
// ─────────────────────────────────────────────────────────────────────────────
async function sendWelcomeEmail(recipientEmail, preferences = {}, unsubscribeToken) {
  console.log(`[Email] sendWelcomeEmail() called for: ${recipientEmail}`);

  const { transporter, isTestAccount } = await getTransporter();
  const unsubUrl = `${BACKEND_URL}/api/subscribe/unsubscribe?token=${unsubscribeToken}`;

  // Build preference summary
  const prefLines = [
    preferences.itCompanies    ? '💻 IT Companies (Google, Microsoft, Flipkart, Swiggy…)'  : null,
    preferences.eceCompanies   ? '🔌 ECE Companies (Qualcomm, Intel, AMD, Texas Instruments…)' : null,
    preferences.internshipsOnly !== false ? '🎓 Internships only' : '📋 All openings',
    ...(preferences.companies || []).map(c => `📌 Specific: ${c}`),
    ...(preferences.roles     || []).map(r => `🔍 Role: ${r}`),
  ].filter(Boolean);

  const prefHtml = prefLines.map(p =>
    `<tr><td style="padding:5px 0;"><div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#374151;">${p}</div></td></tr>`
  ).join('');

  const body = `
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:52px;margin-bottom:16px;">🚀</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0F172A;line-height:1.2;">
        Welcome to InternPulse!
      </h1>
      <p style="color:#64748B;font-size:15px;margin:0;line-height:1.6;">
        Your real-time internship alert system is now active.
      </p>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:linear-gradient(to right,transparent,#E2E8F0,transparent);margin-bottom:28px;"></div>

    <!-- What happens next -->
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:22px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="font-size:20px;">✅</span>
        <span style="font-size:15px;font-weight:700;color:#15803D;">You're all set!</span>
      </div>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">
        Every <strong>6 hours</strong>, InternPulse scans <strong>Remotive, Arbeitnow, The Muse, JSearch</strong>
        and more for new openings. The moment a new internship matching your preferences is found,
        you'll receive an email with the company name, role, location, stipend, and a direct apply link.
      </p>
    </div>

    <!-- Preferences box -->
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:14px;padding:22px;margin-bottom:24px;">
      <h3 style="margin:0 0 14px;font-size:13px;font-weight:700;color:#1D4ED8;text-transform:uppercase;letter-spacing:0.6px;">
        📋 Your Alert Preferences
      </h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${prefHtml || '<tr><td style="font-size:13px;color:#374151;padding:5px 0;">🌍 All internships (IT, ECE, remote &amp; India)</td></tr>'}
      </table>
    </div>

    <!-- What you'll receive -->
    <div style="margin-bottom:28px;">
      <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0F172A;">
        📨 Each alert email includes:
      </h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${[
          ['🏢', 'Company name and logo'],
          ['💼', 'Job title and role description'],
          ['📍', 'Location (city or remote status)'],
          ['💰', 'Stipend / salary if available'],
          ['⏱',  'Internship duration'],
          ['🔗', 'Direct apply link — one click to apply'],
        ].map(([icon, text]) => `
          <tr>
            <td width="28" style="padding:6px 0;vertical-align:top;font-size:16px;">${icon}</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;line-height:1.5;">${text}</td>
          </tr>`).join('')}
      </table>
    </div>

    <!-- Browse CTA -->
    <div style="text-align:center;margin:28px 0;">
      <a href="${FRONTEND_URL}"
        style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.2px;">
        Browse Internships Now →
      </a>
    </div>

    <!-- Tip box -->
    <div style="background:#FAFBFD;border:1px solid #E2E8F0;border-radius:12px;padding:18px;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#64748B;line-height:1.7;">
        <strong style="color:#0F172A;">💡 Pro tip:</strong>
        InternPulse also has a <strong>Resources hub</strong> with resume templates, DSA roadmaps,
        interview guides, and an off-campus strategy — all free, all in one place.
      </p>
    </div>

    <!-- Unsubscribe -->
    <p style="text-align:center;font-size:11px;color:#CBD5E1;margin-top:8px;">
      Don't want these alerts?
      <a href="${unsubUrl}" style="color:#94A3B8;text-decoration:underline;">Unsubscribe instantly</a>
      — one click, takes effect immediately.
    </p>`;

  const html = wrapLayout(body, 'Welcome to InternPulse — your internship alerts are now active! 🚀');

  console.log('[Email] Calling transporter.sendMail()...');

  const info = await withTimeout(
    transporter.sendMail({
      from:    FROM_ADDRESS,
      to:      recipientEmail,
      subject: '🚀 Welcome to InternPulse — Internship Alerts Active!',
      html,
      text: [
        'Welcome to InternPulse!',
        '',
        'Your real-time internship alert system is now active.',
        'Every 6 hours we scan Remotive, Arbeitnow, The Muse, JSearch and more.',
        '',
        'IT Companies: ' + (preferences.itCompanies  ? 'Yes' : 'No'),
        'ECE Companies: '+ (preferences.eceCompanies ? 'Yes' : 'No'),
        'Internships only: ' + (preferences.internshipsOnly !== false ? 'Yes' : 'No'),
        '',
        'Browse internships: ' + FRONTEND_URL,
        'Unsubscribe:        ' + unsubUrl,
      ].join('\n'),
    }),
    SEND_TIMEOUT_MS,
    'sendWelcomeEmail'
  );

  const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) {
    console.log(`[Email] ✅ Welcome email sent! Preview: ${previewUrl}`);
  } else {
    console.log(`[Email] ✅ Welcome email sent to ${recipientEmail} (msgId: ${info.messageId})`);
  }

  return { messageId: info.messageId, previewUrl };
}

// ─────────────────────────────────────────────────────────────────────────────
//  JOB ALERT EMAIL
// ─────────────────────────────────────────────────────────────────────────────
async function sendJobAlertEmail(recipientEmail, newJobs, unsubscribeToken) {
  if (!newJobs?.length) return null;

  console.log(`[Email] sendJobAlertEmail() → ${recipientEmail} (${newJobs.length} jobs)`);

  const { transporter, isTestAccount } = await getTransporter();
  const unsubUrl = `${BACKEND_URL}/api/subscribe/unsubscribe?token=${unsubscribeToken}`;
  const first    = newJobs[0];

  const subject = newJobs.length === 1
    ? `🚀 New Internship at ${first.company}`
    : `🚀 ${newJobs.length} New Internships — ${first.company} and more`;

  const body = `
    <div style="margin-bottom:24px;">
      <div style="display:inline-block;background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;margin-bottom:16px;">
        🔔 ${newJobs.length} new ${newJobs.length === 1 ? 'opening' : 'openings'} detected
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0F172A;line-height:1.3;">
        ${newJobs.length === 1
          ? `New Internship at <span style="color:#2563EB;">${first.company}</span>`
          : `${newJobs.length} New Internships Just Posted`}
      </h1>
      <p style="margin:0;color:#64748B;font-size:14px;">
        Detected by InternPulse · ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
      </p>
    </div>

    ${newJobs.map(j => jobCardHtml(j)).join('')}

    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${FRONTEND_URL}"
        style="display:inline-block;background:#0F172A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:700;">
        View All on InternPulse →
      </a>
    </div>

    <p style="text-align:center;font-size:11px;color:#CBD5E1;margin-top:20px;">
      <a href="${unsubUrl}" style="color:#94A3B8;text-decoration:underline;">Unsubscribe instantly</a>
      &nbsp;·&nbsp; Alerts run every 6 hours
    </p>`;

  const preheader = `${newJobs.length} new internship${newJobs.length > 1 ? 's' : ''} — ${first.company}${newJobs.length > 1 ? ` and ${newJobs.length - 1} more` : ''} just posted`;
  const html = wrapLayout(body, preheader);

  const info = await withTimeout(
    transporter.sendMail({
      from:    FROM_ADDRESS,
      to:      recipientEmail,
      subject,
      html,
      text: newJobs.map(j =>
        `${j.title} at ${j.company}\nLocation: ${j.location || 'India'}${j.stipend ? `\nStipend: ${j.stipend}` : ''}\nApply: ${j.url}`
      ).join('\n\n') + `\n\n---\nUnsubscribe: ${unsubUrl}`,
      headers: {
        'List-Unsubscribe':      `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
    SEND_TIMEOUT_MS,
    'sendJobAlertEmail'
  );

  const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) console.log(`[Email] Alert preview: ${previewUrl}`);
  return { messageId: info.messageId, previewUrl };
}

module.exports = { sendWelcomeEmail, sendJobAlertEmail, sendSubscriptionEmail: sendWelcomeEmail };
