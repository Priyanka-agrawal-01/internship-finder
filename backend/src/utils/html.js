'use strict';

/**
 * Escape text for safe use inside HTML (element content or quoted attributes).
 * Everything that comes from a job API or from a user must go through this
 * before it is placed in an email template or an HTML page.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Return the URL escaped for an href attribute, or '#' if it is not a plain
 * http(s) link (blocks javascript:, data:, etc.).
 */
function safeUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '#';
    return escapeHtml(url.toString());
  } catch {
    return '#';
  }
}

module.exports = { escapeHtml, safeUrl };
