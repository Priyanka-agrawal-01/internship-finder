'use strict';
const mongoose = require('mongoose');

/**
 * A job listing or a company that a signed-in person bookmarked, applied to, or both.
 * `data` is a copy of what the card showed (see utils/savedItems.js), so My Jobs still
 * shows a listing after it leaves the live feed.
 */
const SavedItemSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind:   { type: String, enum: ['job', 'company'], required: true },
  itemId: { type: String, required: true, maxlength: 512 },

  bookmarked:   { type: Boolean, default: false },
  bookmarkedAt: { type: Date, default: null },
  applied:      { type: Boolean, default: false },
  appliedAt:    { type: Date, default: null },

  data:      { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false, minimize: false });

SavedItemSchema.index({ user: 1, kind: 1, itemId: 1 }, { unique: true });

SavedItemSchema.methods.toPublic = function toPublic() {
  return {
    kind:         this.kind,
    itemId:       this.itemId,
    bookmarked:   this.bookmarked,
    bookmarkedAt: this.bookmarkedAt,
    applied:      this.applied,
    appliedAt:    this.appliedAt,
    data:         this.data || {},
    updatedAt:    this.updatedAt,
  };
};

module.exports = mongoose.model('SavedItem', SavedItemSchema);
