'use strict';

/**
 * Checks and trims what the browser sends about a saved job or company. Only the
 * fields My Jobs shows are kept, each with a length cap, links must be http(s),
 * and nothing here ever throws on odd input.
 */

const KINDS = ['job', 'company'];
const MAX_ID_LEN = 512;
const MAX_ITEMS_PER_USER = 2000;
const MAX_IMPORT = 500;

const str = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '');

function link(v) {
  if (typeof v !== 'string' || v.length > 2000) return '';
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function date(v) {
  if (v === null || v === undefined || v === '') return null;
  const d = new Date(v);
  const t = d.getTime();
  // anything before 2000 or more than a day in the future is not a real posting or save date
  if (Number.isNaN(t) || t < 946684800000 || t > Date.now() + 86400000) return null;
  return d;
}

const list = (v, maxItems, maxLen) =>
  (Array.isArray(v) ? v : typeof v === 'string' ? [v] : [])
    .map(x => str(x, maxLen)).filter(Boolean).slice(0, maxItems);

function cleanKind(v) { return KINDS.includes(v) ? v : null; }

function cleanItemId(v) {
  const id = str(v, MAX_ID_LEN + 1);
  return id && id.length <= MAX_ID_LEN ? id : null;
}

/** The copy of a card kept with a saved item. */
function sanitizeItemData(kind, input) {
  const d = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  if (kind === 'company') {
    return {
      name:     str(d.name, 120),
      category: list(d.category, 6, 40),
      location: list(d.location, 6, 60),
      stipend:  str(d.stipend, 60),
      url:      link(d.url || d.careers),
      color:    /^#[0-9a-f]{6}$/i.test(d.color || '') ? d.color : '',
      tab:      d.tab === 'ece' ? 'ece' : 'it',
    };
  }
  return {
    title:        str(d.title, 200),
    company:      str(d.company, 120),
    location:     str(d.location, 120),
    country:      str(d.country, 60),
    workMode:     ['Remote', 'Hybrid', 'On-site'].includes(d.workMode) ? d.workMode : '',
    isInternship: d.isInternship === true,
    url:          link(d.url),
    source:       str(d.source, 40),
    tags:         list(d.tags || d.skills, 8, 40),
    stipend:      str(d.stipend, 60),
    postedAt:     date(d.postedAt),
    logoUrl:      link(d.logoUrl),
  };
}

/** One entry of an import (guest items uploaded at sign-in), or null if unusable. */
function sanitizeImportItem(input) {
  if (!input || typeof input !== 'object') return null;
  const kind = cleanKind(input.kind);
  const itemId = cleanItemId(input.itemId);
  const bookmarked = input.bookmarked === true;
  const applied = input.applied === true;
  if (!kind || !itemId || (!bookmarked && !applied)) return null;
  return {
    kind, itemId, bookmarked, applied,
    bookmarkedAt: bookmarked ? (date(input.bookmarkedAt) || new Date()) : null,
    appliedAt:    applied ? (date(input.appliedAt) || new Date()) : null,
    data: sanitizeItemData(kind, input.data),
  };
}

module.exports = {
  KINDS, MAX_ITEMS_PER_USER, MAX_IMPORT,
  cleanKind, cleanItemId, sanitizeItemData, sanitizeImportItem,
};
