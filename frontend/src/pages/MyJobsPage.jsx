import { useMemo, useState } from 'react';
import { useAuth } from '../auth/authContext';
import { useSaved } from '../saved/savedContext';
import { BookmarkButton, AppliedButton, BookmarkIcon, CheckIcon } from '../components/SaveButtons';

/* ─── Sections and filters ────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'applied',    label: 'Applied',    flag: 'applied',    dateKey: 'appliedAt',    verb: 'Applied' },
  { id: 'bookmarked', label: 'Bookmarked', flag: 'bookmarked', dateKey: 'bookmarkedAt', verb: 'Bookmarked' },
];

const EMPTY = { q: '', type: 'all', workMode: 'any', role: 'any', location: 'any', source: 'any', sort: 'recent' };

const SORTS = [
  { value: 'recent',  label: 'Most recent first' },
  { value: 'oldest',  label: 'Oldest first' },
  { value: 'posted',  label: 'Newest postings' },
  { value: 'company', label: 'Company A–Z' },
];

const nameOf = i => (i.kind === 'company' ? i.data.name : i.data.company) || '';
const titleOf = i => (i.kind === 'company' ? i.data.name : i.data.title) || 'Untitled';

/** The place labels an item can be filtered by: a job's country (or location), a company's offices. */
function placesOf(i) {
  if (i.kind === 'company') return (i.data.location || []).filter(Boolean);
  const p = i.data.country || i.data.location;
  return p ? [p] : [];
}

const fmtDate = d => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function applyFilters(list, f, dateKey) {
  const q = f.q.trim().toLowerCase();
  const jobOnly = f.workMode !== 'any' || f.role !== 'any' || f.source !== 'any';
  const out = list.filter(i => {
    if (f.type !== 'all' && i.kind !== f.type) return false;
    if (jobOnly && i.kind !== 'job') return false;
    if (f.workMode !== 'any' && i.data.workMode !== f.workMode) return false;
    if (f.role === 'internship' && !i.data.isInternship) return false;
    if (f.role === 'fulltime' && i.data.isInternship) return false;
    if (f.source !== 'any' && i.data.source !== f.source) return false;
    if (f.location !== 'any' && !placesOf(i).includes(f.location)) return false;
    if (q) {
      const hay = [titleOf(i), nameOf(i), i.data.location, i.data.country, ...(i.data.tags || []), ...(i.data.category || []), ...placesOf(i)]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const time = v => (v ? new Date(v).getTime() : 0);
  const by = {
    recent:  (a, b) => time(b[dateKey]) - time(a[dateKey]),
    oldest:  (a, b) => time(a[dateKey]) - time(b[dateKey]),
    posted:  (a, b) => time(b.data.postedAt) - time(a.data.postedAt),
    company: (a, b) => nameOf(a).localeCompare(nameOf(b)) || titleOf(a).localeCompare(titleOf(b)),
  }[f.sort] || (() => 0);
  return out.sort(by);
}

const activeCount = f => Object.keys(EMPTY).filter(k => k !== 'sort' && f[k] !== EMPTY[k]).length;

/* ─── Small parts ─────────────────────────────────────────────────────────── */
const selectCls = 'w-full rounded-xl border border-[#C3D4D2] bg-white px-3 py-2 text-sm text-[#06525C] focus:outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/15';

function Select({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#2F737D] mb-1">{label}</span>
      <select className={selectCls} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Segmented({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex p-1 rounded-xl bg-[#EBF0EE] border border-[#D5E1DF]">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            value === o.value ? 'bg-white text-[#06525C] shadow-sm' : 'text-[#2F737D] hover:text-[#06525C]'
          }`}>
          {o.label}{o.count !== undefined && <span className="ml-1 text-[#5E8D93]">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

function Initials({ name, color }) {
  const bg = color || '#06525C';
  return (
    <div className="w-11 h-11 rounded-xl grid place-items-center text-sm font-bold text-white shrink-0" style={{ background: bg }} aria-hidden="true">
      {(name || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?'}
    </div>
  );
}

function Chip({ children, tone = 'plain' }) {
  const tones = {
    plain:  'text-[#2F737D] bg-[#F7F9F8] border-[#D5E1DF]',
    intern: 'text-[#A16207] bg-[#FEFCE8] border-[#FDE68A]',
    good:   'text-[#067647] bg-[#ECFDF3] border-[#ABEFC6]',
  };
  return <span className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-full px-2.5 py-0.5 ${tones[tone]}`}>{children}</span>;
}

/* ─── One saved job or company ───────────────────────────────────────────── */
function SavedCard({ item, section }) {
  const saved = useSaved();
  const d = item.data || {};
  const isJob = item.kind === 'job';
  const date = item[section.dateKey];

  return (
    <article className="bg-white border border-[#D5E1DF] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Initials name={isJob ? d.company : d.name} color={isJob ? null : d.color} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5E8D93]">{isJob ? 'Job' : 'Company'}</p>
          <h3 className="text-sm font-bold text-[#06525C] leading-snug line-clamp-2">{titleOf(item)}</h3>
          {isJob && <p className="text-xs text-[#2F737D] font-medium mt-0.5 truncate">{d.company}</p>}
        </div>
        <BookmarkButton on={item.bookmarked} label={isJob ? 'job' : 'company'}
          onClick={() => saved.toggleBookmark(item.kind, item.itemId)} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {isJob ? (
          <>
            {(d.location || d.country) && <Chip>📍 {d.location || d.country}</Chip>}
            {d.workMode && <Chip>{d.workMode}</Chip>}
            {d.isInternship && <Chip tone="intern">🎓 Internship</Chip>}
            {d.stipend && <Chip tone="good">💰 {d.stipend}</Chip>}
            {d.source && <Chip>{d.source}</Chip>}
          </>
        ) : (
          <>
            {(d.location || []).slice(0, 3).map(l => <Chip key={l}>📍 {l}</Chip>)}
            {(d.category || []).slice(0, 2).map(c => <Chip key={c}>{c}</Chip>)}
            {d.stipend && <Chip tone="good">💰 {d.stipend}</Chip>}
          </>
        )}
      </div>

      <p className="text-xs text-[#2F737D]">
        {section.verb} {fmtDate(date)}
        {isJob && d.postedAt && <span className="text-[#5E8D93]"> · posted {fmtDate(d.postedAt)}</span>}
      </p>

      <div className="flex gap-2 mt-auto pt-1">
        {d.url ? (
          <a href={d.url} target="_blank" rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#06525C] hover:bg-[#043F47] transition-colors">
            {isJob ? 'Open listing ↗' : 'Careers page ↗'}
          </a>
        ) : (
          <span className="flex-1 inline-flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-[#5E8D93] bg-[#F7F9F8] border border-[#D5E1DF]">No link saved</span>
        )}
        <AppliedButton on={item.applied} onClick={() => saved.toggleApplied(item.kind, item.itemId)} />
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function MyJobsPage({ onNavigate }) {
  const { status, user, openAuth, deleteAccount, signOut } = useAuth();
  const saved = useSaved();
  const [sectionId, setSectionId] = useState('applied');
  const [filters, setFilters] = useState({ applied: EMPTY, bookmarked: EMPTY });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const section = SECTIONS.find(s => s.id === sectionId);
  const f = filters[sectionId];
  const setF = patch => setFilters(all => ({ ...all, [sectionId]: { ...all[sectionId], ...patch } }));

  const inSection = useMemo(() => saved.items.filter(i => i[section.flag]), [saved.items, section]);
  const shown = useMemo(() => applyFilters(inSection, f, section.dateKey), [inSection, f, section]);

  const placeOptions = useMemo(() => {
    const set = new Set(inSection.flatMap(placesOf));
    return [{ value: 'any', label: 'Anywhere' }, ...[...set].sort().map(p => ({ value: p, label: p }))];
  }, [inSection]);
  const sourceOptions = useMemo(() => {
    const set = new Set(inSection.filter(i => i.kind === 'job').map(i => i.data.source).filter(Boolean));
    return [{ value: 'any', label: 'Any board' }, ...[...set].sort().map(s => ({ value: s, label: s }))];
  }, [inSection]);

  const jobs = inSection.filter(i => i.kind === 'job').length;
  const companies = inSection.length - jobs;
  const filtered = activeCount(f);
  const jobFiltersOn = f.type !== 'company';

  const onDelete = async () => {
    setDeleteError('');
    try { await deleteAccount(); setConfirmDelete(false); } catch (err) { setDeleteError(err.message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#06525C]">My Jobs</h1>
          <p className="text-sm text-[#2F737D] mt-1 max-w-xl">
            Every job and company you bookmarked or applied to, in one place. Use the bookmark and Mark applied buttons on any job or company card to add to it.
          </p>
        </div>
        {status === 'signedIn' && (
          <p className="text-sm text-[#2F737D]">Signed in as <span className="font-semibold text-[#06525C]">{user.email}</span></p>
        )}
      </div>

      {/* Guest banner */}
      {status !== 'signedIn' && (
        <div className="mb-6 rounded-2xl border border-[#B5D2D0] bg-[#E6F0EF] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <p className="flex-1 text-sm text-[#06424A]">
            <span className="font-semibold">You’re not signed in.</span> Your saved jobs are kept in this browser only. Sign in to keep them in your account and see them on any device; what you saved here comes with you.
          </p>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => openAuth('signin')} className="px-4 py-2 rounded-xl bg-[#06525C] hover:bg-[#043F47] text-white text-sm font-semibold">Sign in</button>
            <button onClick={() => openAuth('signup')} className="px-4 py-2 rounded-xl bg-white border border-[#B5D2D0] text-[#06525C] text-sm font-semibold hover:border-[#06525C]">Create account</button>
          </div>
        </div>
      )}

      {/* Section switch */}
      <div role="tablist" aria-label="My Jobs sections" className="grid grid-cols-2 gap-3 mb-5">
        {SECTIONS.map(s => {
          const on = s.id === sectionId;
          const count = saved.counts[s.flag];
          return (
            <button key={s.id} role="tab" aria-selected={on} onClick={() => setSectionId(s.id)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                on ? 'bg-[#06525C] border-[#06525C] text-white' : 'bg-white border-[#D5E1DF] text-[#06525C] hover:border-[#06525C]'
              }`}>
              <span className={`w-10 h-10 rounded-xl grid place-items-center ${on ? 'bg-white/15' : 'bg-[#E6F0EF]'}`}>
                {s.id === 'applied' ? <CheckIcon size={18} /> : <BookmarkIcon on size={18} />}
              </span>
              <span>
                <span className="block text-base font-bold">{s.label}</span>
                <span className={`block text-xs ${on ? 'text-white/80' : 'text-[#2F737D]'}`}>{count} {count === 1 ? 'item' : 'items'}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters for this section */}
      <section aria-label={`Filter ${section.label.toLowerCase()} items`} className="bg-white border border-[#D5E1DF] rounded-2xl p-4 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E8D93]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <input type="search" value={f.q} onChange={e => setF({ q: e.target.value })}
              placeholder={`Search ${section.label.toLowerCase()} by role, company, skill or place`}
              aria-label={`Search ${section.label.toLowerCase()} items`}
              className="w-full rounded-xl border border-[#C3D4D2] bg-white pl-9 pr-3 py-2.5 text-sm text-[#06525C] placeholder:text-[#5E8D93] focus:outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/15" />
          </div>
          <Segmented label="Item type" value={f.type} onChange={type => setF({ type })}
            options={[{ value: 'all', label: 'All', count: inSection.length }, { value: 'job', label: 'Jobs', count: jobs }, { value: 'company', label: 'Companies', count: companies }]} />
        </div>
        <div className={`grid gap-3 ${jobFiltersOn ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2'}`}>
          {jobFiltersOn && (
            <>
              <Select label="Work mode" value={f.workMode} onChange={workMode => setF({ workMode })}
                options={[{ value: 'any', label: 'Any' }, { value: 'Remote', label: 'Remote' }, { value: 'Hybrid', label: 'Hybrid' }, { value: 'On-site', label: 'On-site' }]} />
              <Select label="Role type" value={f.role} onChange={role => setF({ role })}
                options={[{ value: 'any', label: 'Any' }, { value: 'internship', label: 'Internships' }, { value: 'fulltime', label: 'Full-time jobs' }]} />
              <Select label="Job board" value={f.source} onChange={source => setF({ source })} options={sourceOptions} />
            </>
          )}
          <Select label="Location" value={f.location} onChange={location => setF({ location })} options={placeOptions} />
          <Select label="Sort" value={f.sort} onChange={sort => setF({ sort })}
            options={SORTS.map(s => ({ ...s, label: s.value === 'recent' ? `${section.verb} most recently` : s.value === 'oldest' ? `${section.verb} longest ago` : s.label }))} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm">
          <p className="text-[#2F737D]">
            Showing <span className="font-semibold text-[#06525C]">{shown.length}</span> of {inSection.length}
            {f.type === 'all' && (f.workMode !== 'any' || f.role !== 'any' || f.source !== 'any') && companies > 0 && ' (work mode, role type and board filters show jobs only)'}
          </p>
          {filtered > 0 && (
            <button onClick={() => setF({ ...EMPTY, sort: f.sort })} className="font-semibold text-[#06525C] underline underline-offset-2">
              Clear {filtered} {filtered === 1 ? 'filter' : 'filters'}
            </button>
          )}
        </div>
      </section>

      {/* Items */}
      {!saved.ready ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true">
          {[0, 1, 2].map(n => <div key={n} className="h-48 rounded-2xl bg-[#EBF0EE] animate-pulse" />)}
        </div>
      ) : inSection.length === 0 ? (
        <div className="text-center bg-white border border-dashed border-[#C3D4D2] rounded-2xl px-6 py-12">
          <p className="text-lg font-bold text-[#06525C]">{sectionId === 'applied' ? 'No applications tracked yet' : 'No bookmarks yet'}</p>
          <p className="text-sm text-[#2F737D] mt-1 max-w-md mx-auto">
            {sectionId === 'applied'
              ? 'After you apply on a company’s site, press Mark applied on its card here on InternPulse to track it.'
              : 'Press the bookmark on any job or company card to keep it for later.'}
          </p>
          <div className="flex justify-center gap-2 mt-5">
            <button onClick={() => onNavigate('jobs')} className="px-4 py-2 rounded-xl bg-[#06525C] hover:bg-[#043F47] text-white text-sm font-semibold">Browse jobs</button>
            <button onClick={() => onNavigate('companies')} className="px-4 py-2 rounded-xl bg-white border border-[#C3D4D2] text-[#06525C] text-sm font-semibold hover:border-[#06525C]">Browse companies</button>
          </div>
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center bg-white border border-dashed border-[#C3D4D2] rounded-2xl px-6 py-10">
          <p className="font-bold text-[#06525C]">Nothing here matches these filters</p>
          <button onClick={() => setF({ ...EMPTY, sort: f.sort })} className="mt-3 text-sm font-semibold text-[#06525C] underline underline-offset-2">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map(item => <SavedCard key={`${item.kind}:${item.itemId}`} item={item} section={section} />)}
        </div>
      )}

      {/* Account */}
      {status === 'signedIn' && (
        <div className="mt-12 pt-6 border-t border-[#D5E1DF] flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
          <p className="flex-1 text-[#2F737D]">Account: {user.name} ({user.email}){user.google ? ' · Google' : ''}</p>
          <div className="flex gap-2">
            <button onClick={signOut} className="px-3 py-2 rounded-lg border border-[#C3D4D2] text-[#06525C] font-semibold hover:border-[#06525C]">Sign out</button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="px-3 py-2 rounded-lg text-[#B42318] font-semibold hover:bg-[#FEF3F2]">Delete account</button>
            ) : (
              <span className="flex items-center gap-2 rounded-lg border border-[#FECDCA] bg-[#FEF3F2] px-3 py-1.5">
                <span className="text-[#B42318]">Delete your account and every saved item? This can’t be undone.</span>
                <button onClick={onDelete} className="px-2.5 py-1 rounded-md bg-[#B42318] text-white font-semibold">Delete</button>
                <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 rounded-md text-[#06525C] font-semibold">Cancel</button>
              </span>
            )}
          </div>
          {deleteError && <p role="alert" className="text-[#B42318] w-full">{deleteError}</p>}
        </div>
      )}
    </div>
  );
}
