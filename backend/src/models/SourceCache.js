'use strict';
const mongoose = require('mongoose');

/**
 * The last results of a job source with a request quota (JSearch, Adzuna, Jooble),
 * kept in the database so a restart, or a second server sharing the database,
 * reuses them instead of spending quota on the same search again.
 */
const SourceCacheSchema = new mongoose.Schema({
  _id:       { type: String },                 // the source's key, e.g. "jsearch"
  fetchedAt: { type: Date, required: true },   // the last attempt, successful or not
  jobs:      { type: [mongoose.Schema.Types.Mixed], default: [] },
  error:     { type: String, default: null },  // why the last attempt failed, if it did
  keyHash:   { type: String, default: '' },    // fingerprint of the API key used, so a new key fetches at once
}, { versionKey: false });

module.exports = mongoose.model('SourceCache', SourceCacheSchema);
