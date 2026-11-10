import { useCallback, useEffect, useMemo, useState } from 'react';
import { SavedContext, companyData } from './savedContext';
import { useAuth } from '../auth/authContext';
import { api } from '../lib/api';
import { IT_COMPANIES, ECE_COMPANIES } from '../data/companiesData';

const GUEST_KEY = 'ip_saved_items_v1';
const LEGACY_BOOKMARKS = 'ip_bookmarked_companies';   // the Companies page's old browser-only lists
const LEGACY_APPLIED   = 'ip_applied_companies';
const IMPORT_BATCH = 100;
const NONE = [];

const keyOf = (kind, itemId) => `${kind}:${itemId}`;

function readJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
}

/** The guest list, with the Companies page's old lists folded in the first time. */
function readGuest() {
  const items = Array.isArray(readJSON(GUEST_KEY, [])) ? readJSON(GUEST_KEY, []) : [];
  const oldB = readJSON(LEGACY_BOOKMARKS, null);
  const oldA = readJSON(LEGACY_APPLIED, null);
  if (!Array.isArray(oldB) && !Array.isArray(oldA)) return items;

  const now = new Date().toISOString();
  const byKey = new Map(items.map(i => [keyOf(i.kind, i.itemId), i]));
  const mark = (ids, flag) => (Array.isArray(ids) ? ids : []).forEach(id => {
    const c = IT_COMPANIES.find(x => x.id === id) || ECE_COMPANIES.find(x => x.id === id);
    if (!c) return;
    const k = keyOf('company', id);
    const prev = byKey.get(k) || { kind: 'company', itemId: id, bookmarked: false, applied: false, bookmarkedAt: null, appliedAt: null,
      data: companyData(c, IT_COMPANIES.includes(c) ? 'it' : 'ece'), updatedAt: now };
    byKey.set(k, { ...prev, [flag]: true, [`${flag}At`]: prev[`${flag}At`] || now });
  });
  mark(oldB, 'bookmarked');
  mark(oldA, 'applied');
  const merged = [...byKey.values()];
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(merged));
    localStorage.removeItem(LEGACY_BOOKMARKS);
    localStorage.removeItem(LEGACY_APPLIED);
  } catch { /* storage blocked: keep them in memory */ }
  return merged;
}

/** The list after setting `flags` on one item; an item with no flag left is dropped. */
function withFlags(list, kind, itemId, flags, data) {
  const k = keyOf(kind, itemId);
  const prev = list.find(i => keyOf(i.kind, i.itemId) === k);
  const now = new Date().toISOString();
  const next = { ...(prev || { kind, itemId, bookmarked: false, applied: false, bookmarkedAt: null, appliedAt: null, data: {} }) };
  for (const [flag, on] of Object.entries(flags)) {
    next[flag] = on;
    next[`${flag}At`] = on ? (prev?.[flag] ? prev[`${flag}At`] : now) : null;
  }
  if (data) next.data = data;
  next.updatedAt = now;
  if (!next.bookmarked && !next.applied) return list.filter(i => keyOf(i.kind, i.itemId) !== k);
  return prev ? list.map(i => (keyOf(i.kind, i.itemId) === k ? next : i)) : [next, ...list];
}

export default function SavedProvider({ children }) {
  const { status, token } = useAuth();
  const signedIn = status === 'signedIn';

  const [guestItems, setGuestItems]   = useState(readGuest);
  const [serverItems, setServerItems] = useState([]);
  const [syncedToken, setSyncedToken] = useState(null);  // the session serverItems belong to
  const [error, setError] = useState('');

  // keep the guest list in this browser
  useEffect(() => {
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(guestItems)); } catch { /* storage blocked */ }
  }, [guestItems]);

  // On sign-in: upload what was saved as a guest, then load the account's list
  useEffect(() => {
    if (!signedIn || !token) return;
    let off = false;
    (async () => {
      const guest = readJSON(GUEST_KEY, []);
      for (let i = 0; i < guest.length; i += IMPORT_BATCH) {
        await api('/api/me/saved/import', { method: 'POST', token, body: { items: guest.slice(i, i + IMPORT_BATCH) } });
      }
      const r = await api('/api/me/saved', { token });
      if (off) return;
      if (guest.length) setGuestItems([]);
      setServerItems(r.items);
      setSyncedToken(token);
    })().catch(err => {
      if (off) return;
      setError(`Your saved items could not be loaded: ${err.message}`);
      setSyncedToken(token);
    });
    return () => { off = true; };
  }, [signedIn, token]);

  const ready = !signedIn || syncedToken === token;
  // while an account's list loads, show nothing rather than the previous account's items
  const items = useMemo(() => (!signedIn ? guestItems : ready ? serverItems : NONE), [signedIn, ready, guestItems, serverItems]);

  const byKey = useMemo(() => new Map(items.map(i => [keyOf(i.kind, i.itemId), i])), [items]);
  const isBookmarked = useCallback((kind, id) => !!byKey.get(keyOf(kind, id))?.bookmarked, [byKey]);
  const isApplied    = useCallback((kind, id) => !!byKey.get(keyOf(kind, id))?.applied, [byKey]);

  const setFlags = useCallback(async (kind, itemId, flags, data) => {
    if (!signedIn) { setGuestItems(list => withFlags(list, kind, itemId, flags, data)); return; }
    setServerItems(list => withFlags(list, kind, itemId, flags, data));   // show it at once
    try {
      const r = await api('/api/me/saved', { method: 'PUT', token, body: { kind, itemId, ...flags, ...(data ? { data } : {}) } });
      const k = keyOf(kind, itemId);
      setServerItems(list => (r.item
        ? list.map(i => (keyOf(i.kind, i.itemId) === k ? r.item : i))
        : list.filter(i => keyOf(i.kind, i.itemId) !== k)));
    } catch (err) {
      setError(`That change was not saved: ${err.message}`);
      api('/api/me/saved', { token }).then(r => setServerItems(r.items)).catch(() => {});   // back to what the server has
    }
  }, [signedIn, token]);

  const toggleBookmark = useCallback((kind, id, data) => setFlags(kind, id, { bookmarked: !isBookmarked(kind, id) }, data), [setFlags, isBookmarked]);
  const toggleApplied  = useCallback((kind, id, data) => setFlags(kind, id, { applied: !isApplied(kind, id) }, data), [setFlags, isApplied]);
  const remove         = useCallback((kind, id) => setFlags(kind, id, { bookmarked: false, applied: false }), [setFlags]);

  const counts = useMemo(() => ({
    bookmarked: items.filter(i => i.bookmarked).length,
    applied:    items.filter(i => i.applied).length,
  }), [items]);

  const value = useMemo(() => ({ items, ready, counts, isBookmarked, isApplied, toggleBookmark, toggleApplied, remove }),
    [items, ready, counts, isBookmarked, isApplied, toggleBookmark, toggleApplied, remove]);

  return (
    <SavedContext.Provider value={value}>
      {children}
      {error && (
        <div role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[calc(100%-32px)] bg-[#B42318] text-white text-sm rounded-xl px-4 py-3 shadow-lg flex items-start gap-3">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="font-semibold underline underline-offset-2">Dismiss</button>
        </div>
      )}
    </SavedContext.Provider>
  );
}
