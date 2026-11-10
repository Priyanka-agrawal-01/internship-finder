'use strict';
const mongoose = require('mongoose');

/**
 * An InternPulse account. A person signs in with an email and password, with
 * Google, or both (a Google sign-in links to the account with the same email).
 */
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  name:  { type: String, default: '', trim: true, maxlength: 60 },

  // "scrypt$<N>$<r>$<p>$<salt>$<hash>" (see utils/passwords.js); empty for Google-only accounts
  passwordHash: { type: String, default: '' },

  // Google's stable account id ("sub"); unique when present
  googleId: { type: String, default: undefined },

  // true once Google has vouched for the address (or the site owner, for an admin
  // made with `npm run create-admin`); email sign-ups are not verified
  emailVerified: { type: Boolean, default: false },

  // 'admin' only through `npm run create-admin`, never through the API
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // wrong passwords in a row, and the lock they trigger (see routes/authRoutes.js)
  failedLogins: { type: Number, default: 0 },
  lockedUntil:  { type: Date, default: null },

  createdAt:   { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: null },
}, { versionKey: false });

UserSchema.index({ createdAt: -1 });

UserSchema.index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } });

/** What the API returns about the signed-in person: never the password hash. */
UserSchema.methods.toPublic = function toPublic() {
  return {
    id:          String(this._id),
    email:       this.email,
    name:        this.name || this.email.split('@')[0],
    hasPassword: !!this.passwordHash,
    google:      !!this.googleId,
    role:        this.role === 'admin' ? 'admin' : 'user',
    createdAt:   this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
