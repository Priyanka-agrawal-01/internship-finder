'use strict';
const mongoose = require('mongoose');
const crypto   = require('crypto');

// ─── Preference sub-schema ────────────────────────────────────────────────────
const PreferencesSchema = new mongoose.Schema({
  // Broad category toggles
  itCompanies:       { type: Boolean, default: true  },
  eceCompanies:      { type: Boolean, default: false },
  // Role keyword filters (empty = match all)
  roles:             { type: [String], default: []   },
  // Specific company names (empty = match all)
  companies:         { type: [String], default: []   },
  // Only internships? (false = include all active openings)
  internshipsOnly:   { type: Boolean, default: true  },
}, { _id: false });

// ─── Subscriber schema ────────────────────────────────────────────────────────
const SubscriberSchema = new mongoose.Schema({
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true,
    match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
  },

  // Preferences selected during signup
  preferences: { type: PreferencesSchema, default: () => ({}) },

  // Unique token used in one-click unsubscribe links
  unsubscribeToken: {
    type:    String,
    unique:  true,
    default: () => crypto.randomBytes(32).toString('hex'),
  },

  active:    { type: Boolean, default: true  },
  createdAt: { type: Date,    default: Date.now },

  // Track last time an alert was sent to this subscriber
  lastAlertSentAt: { type: Date, default: null },

  // Total alerts delivered so far
  alertCount: { type: Number, default: 0 },
}, {
  timestamps: false, // Using createdAt manually above
  versionKey: false,
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email: indexed via unique:true above
// unsubscribeToken: indexed via unique:true above (do NOT add again here)
SubscriberSchema.index({ active: 1 });   // fast query for active subscribers

module.exports = mongoose.model('Subscriber', SubscriberSchema);
