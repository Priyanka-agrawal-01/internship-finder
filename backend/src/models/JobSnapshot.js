'use strict';
const mongoose = require('mongoose');

/**
 * Stores a snapshot of every job ID we have ever seen.
 * Used to work out which jobs are new since a subscriber's last alert, and
 * holds the fields needed to match a job against alert preferences.
 */
const JobSnapshotSchema = new mongoose.Schema({
  jobId:     { type: String, required: true, unique: true },
  title:     { type: String, required: true },
  company:   { type: String, required: true },
  location:  { type: String, default: '' },
  country:   { type: String, default: '' },
  workMode:  { type: String, default: '' },
  isRemote:  { type: Boolean, default: false },
  url:       { type: String, default: '' },
  source:    { type: String, default: 'Unknown' },
  stipend:   { type: String, default: null },     // optional salary/stipend string
  tags:      { type: [String], default: [] },
  isInternship: { type: Boolean, default: false },
  postedAt:     { type: Date, default: null },
  firstSeenAt:  { type: Date, default: Date.now },
}, {
  versionKey: false,
});

// TTL index: automatically remove snapshots older than 90 days
JobSnapshotSchema.index({ firstSeenAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });
JobSnapshotSchema.index({ company: 1 });

module.exports = mongoose.model('JobSnapshot', JobSnapshotSchema);
