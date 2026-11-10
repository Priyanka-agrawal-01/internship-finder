'use strict';
const mongoose = require('mongoose');

/** One page view (see utils/analytics.js). Anonymous: no IP, no account, no email. */
const VisitSchema = new mongoose.Schema({
  at:         { type: Date, required: true },
  visitorId:  { type: String, required: true },
  sessionId:  { type: String, required: true },
  page:       { type: String, required: true },
  newVisitor: { type: Boolean, default: false },
  referrer:   { type: String, default: '' },
  utmSource:  { type: String, default: '' },
  device:     { type: String, default: 'Desktop' },
  browser:    { type: String, default: 'Other' },
  os:         { type: String, default: 'Other' },
}, { versionKey: false });

// a year of history, then MongoDB drops it
VisitSchema.index({ at: 1 }, { expireAfterSeconds: 365 * 24 * 3600 });

module.exports = mongoose.model('Visit', VisitSchema);
