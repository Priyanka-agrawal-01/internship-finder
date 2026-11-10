'use strict';
const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/security');
const {
  MAX_ITEMS_PER_USER, MAX_IMPORT,
  cleanKind, cleanItemId, sanitizeItemData, sanitizeImportItem,
} = require('../utils/savedItems');

const SavedItem = () => require('../models/SavedItem');

router.use(requireAuth);

const body = req => (req.body && typeof req.body === 'object' ? req.body : {});

const publicItem = d => ({
  kind: d.kind, itemId: d.itemId,
  bookmarked: !!d.bookmarked, bookmarkedAt: d.bookmarkedAt || null,
  applied: !!d.applied, appliedAt: d.appliedAt || null,
  data: d.data || {}, updatedAt: d.updatedAt,
});

// GET /api/me/saved: everything this person bookmarked or applied to
router.get('/saved', asyncHandler(async (req, res) => {
  const items = await SavedItem().find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(MAX_ITEMS_PER_USER);
  res.json({ success: true, items: items.map(i => i.toPublic()) });
}));

// PUT /api/me/saved  { kind, itemId, bookmarked?, applied?, data? }
// Sets the flags it is given in one atomic update, so two quick clicks (bookmark,
// then applied) on a new item can't race. An item with neither flag left is deleted.
// (The id travels in the body: job ids are long and may hold characters that
// proxies treat differently inside a URL path.)
router.put('/saved', asyncHandler(async (req, res) => {
  const b = body(req);
  const kind = cleanKind(b.kind);
  const itemId = cleanItemId(b.itemId);
  if (!kind || !itemId) return res.status(400).json({ success: false, message: 'Unknown item.' });
  const hasB = typeof b.bookmarked === 'boolean';
  const hasA = typeof b.applied === 'boolean';
  if (!hasB && !hasA) return res.status(400).json({ success: false, message: 'Nothing to change.' });

  const Model = SavedItem();
  const filter = { user: req.user._id, kind, itemId };
  const creates = !!(b.bookmarked || b.applied);
  if (creates && !(await Model.exists(filter)) && await Model.countDocuments({ user: req.user._id }) >= MAX_ITEMS_PER_USER) {
    return res.status(409).json({ success: false, message: `You can keep up to ${MAX_ITEMS_PER_USER} saved items. Remove some first.` });
  }

  // Every expression in one $set stage reads the document as it was, so '$bookmarked'
  // is the old value: a flag that was already on keeps its original date.
  const now = new Date();
  const flag = (name, has, on) => {
    const field = '$' + name;
    const dateField = '$' + name + 'At';
    if (!has) return { [name]: { $ifNull: [field, false] }, [name + 'At']: { $ifNull: [dateField, null] } };
    return { [name]: on, [name + 'At']: on ? { $cond: [{ $eq: [field, true] }, { $ifNull: [dateField, now] }, now] } : null };
  };
  const update = [{ $set: {
    ...flag('bookmarked', hasB, b.bookmarked),
    ...flag('applied', hasA, b.applied),
    data: b.data && typeof b.data === 'object' ? { $literal: sanitizeItemData(kind, b.data) } : { $ifNull: ['$data', { $literal: {} }] },
    updatedAt: now,
  } }];

  const doc = await Model.collection.findOneAndUpdate(filter, update, { upsert: creates, returnDocument: 'after' });
  if (!doc) return res.json({ success: true, item: null });
  if (!doc.bookmarked && !doc.applied) {
    await Model.deleteOne({ _id: doc._id, bookmarked: false, applied: false });
    return res.json({ success: true, item: null });
  }
  res.json({ success: true, item: publicItem(doc) });
}));

// POST /api/me/saved/import  { items: [...] }
// Merges what a guest saved in this browser into the account when they sign in.
// Flags only ever turn on, and the earliest date wins, so importing twice is harmless.
router.post('/saved/import', asyncHandler(async (req, res) => {
  const raw = Array.isArray(body(req).items) ? body(req).items.slice(0, MAX_IMPORT) : [];
  const incoming = raw.map(sanitizeImportItem).filter(Boolean);
  if (!incoming.length) return res.json({ success: true, imported: 0 });

  const Model = SavedItem();
  const userId = req.user._id;
  const existing = await Model.find({ user: userId, $or: incoming.map(({ kind, itemId }) => ({ kind, itemId })) });
  const byKey = new Map(existing.map(i => [`${i.kind}:${i.itemId}`, i]));
  let room = MAX_ITEMS_PER_USER - await Model.countDocuments({ user: userId });

  const earliest = (a, b) => (!a ? b : !b ? a : new Date(Math.min(new Date(a), new Date(b))));
  const ops = [];
  for (const it of incoming) {
    const prev = byKey.get(`${it.kind}:${it.itemId}`);
    if (!prev && room-- <= 0) continue;
    const set = {
      bookmarked:   !!(prev?.bookmarked || it.bookmarked),
      applied:      !!(prev?.applied || it.applied),
      bookmarkedAt: earliest(prev?.bookmarked ? prev.bookmarkedAt : null, it.bookmarked ? it.bookmarkedAt : null),
      appliedAt:    earliest(prev?.applied ? prev.appliedAt : null, it.applied ? it.appliedAt : null),
      data:         prev && Object.keys(prev.data || {}).length ? prev.data : it.data,
      updatedAt:    new Date(),
    };
    ops.push({ updateOne: { filter: { user: userId, kind: it.kind, itemId: it.itemId }, update: { $set: set }, upsert: true } });
  }
  if (ops.length) await Model.bulkWrite(ops, { ordered: false });
  res.json({ success: true, imported: ops.length });
}));

module.exports = router;
