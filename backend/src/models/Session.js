'use strict';
const mongoose = require('mongoose');

/**
 * A signed-in browser. The browser holds a random token; only its SHA-256 is
 * stored here, so a database leak doesn't hand out working sessions. Signing
 * out deletes the document; MongoDB drops expired ones on its own.
 */
const SessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', SessionSchema);
