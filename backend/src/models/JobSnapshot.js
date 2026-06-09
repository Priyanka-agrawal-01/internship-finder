'use strict';
const mongoose = require('mongoose');

/**
 * Stores a snapshot of every job ID we have ever seen.
 * Used to diff against fresh API results to find *new* openings.
 */
const JobSnapshotSchema = new mongoose.Schema({
  jobId:     { type: String, required: true, unique: true },
  title:     { type: String, required: true },
  company:   { type: String, required: true },
  location:  { type: String, default: 'India' },
  url:       { type: String, default: '' },
  source:    { type: String, default: 'Unknown' },
  stipend:   { type: String, default: null },     // optional salary/stipend string
  tags:      { type: [String], default: [] },
  isInternship: { type: Boolean, default: false },
  firstSeenAt:  { type: Date, default: Date.now },
  // Alert dispatched flag — true once we've sent notifications for this job
  alertSent: { type: Boolean, default: false },
}, {
  versionKey: false,
});

// TTL index: automatically remove snapshots older than 90 days
JobSnapshotSchema.index({ firstSeenAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });
JobSnapshotSchema.index({ company: 1 });
JobSnapshotSchema.index({ alertSent: 1 });

module.exports = mongoose.model('JobSnapshot', JobSnapshotSchema);
