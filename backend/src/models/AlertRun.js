'use strict';
const mongoose = require('mongoose');

/**
 * One document per alert cycle (its _id is the UTC hour, e.g. "2026-11-10T19").
 * Every server that shares the database tries to insert it before sending alerts;
 * only the first insert succeeds, so two instances (a local dev server and the
 * deployed one, or two deployed replicas) never email the same subscriber twice.
 */
const AlertRunSchema = new mongoose.Schema({
  _id:       { type: String },
  host:      { type: String, default: '' },
  startedAt: { type: Date, default: Date.now },
  // filled in when the cycle ends (services/alertService.js)
  finishedAt:  { type: Date, default: null },
  jobs:        { type: Number, default: 0 },   // jobs in the feed
  newJobs:     { type: Number, default: 0 },   // seen for the first time
  subscribers: { type: Number, default: 0 },   // active subscribers
  due:         { type: Number, default: 0 },   // whose frequency allowed an email
  sent:        { type: Number, default: 0 },
  failed:      { type: Number, default: 0 },
  error:       { type: String, default: '' },
}, { versionKey: false });

// keep a week of history, then let MongoDB drop it
AlertRunSchema.index({ startedAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });

module.exports = mongoose.model('AlertRun', AlertRunSchema);
