'use strict';
const mongoose = require('mongoose');
const crypto   = require('crypto');

// ─── Preference sub-schema ────────────────────────────────────────────────────
const PreferencesSchema = new mongoose.Schema({
  itCompanies:       { type: Boolean, default: true  },
  eceCompanies:      { type: Boolean, default: false },
  remoteInternships: { type: Boolean, default: false },
  productCompanies:  { type: Boolean, default: false },
  startups:          { type: Boolean, default: false },
  aiMlRoles:         { type: Boolean, default: false },
  frontendRoles:     { type: Boolean, default: false },
  backendRoles:      { type: Boolean, default: false },
  vlsiRoles:         { type: Boolean, default: false },
  embeddedRoles:     { type: Boolean, default: false },
  frequency:         { type: String, enum: ['instant', '6hours', 'daily'], default: '6hours' },
  locations:         { type: [String], default: [] },
  
  // Keep legacy options for safety
  roles:             { type: [String], default: []   },
  companies:         { type: [String], default: []   },
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
