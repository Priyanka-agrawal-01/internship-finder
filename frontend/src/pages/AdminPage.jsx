import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/authContext';
import { api, BACKEND_URL } from '../lib/api';

/* ─── Formatting ──────────────────────────────────────────────────────────── */
const TZ = 'Asia/Kolkata';
const fmtNum = n => new Intl.NumberFormat('en-IN', n >= 10000 ? { notation: 'compact', maximumFractionDigits: 1 } : {}).format(n || 0);
const fmtDate = d => (d ? new Date(d).toLocaleDateString('en-IN', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const fmtTime = d => (d ? new Date(d).toLocaleString('en-IN', { timeZone: TZ, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
const fmtDay = ymd => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString('en-IN', { timeZone: TZ, day: 'numeric', month: 'short' });
const ago = d => {
  if (!d) return 'never';
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
};

const PAGE_NAMES = {
  landing: 'Landing page', jobs: 'Job feed', companies: 'Companies', resources: 'Resources', blog: 'Blog',
  about: 'About', alerts: 'Job alerts', myjobs: 'My Jobs', admin: 'Admin',
};
const FREQ = { instant: 'Hourly', '6hours': 'Every 6 hours', daily: 'Daily' };

const MARK = '#008C99';        // chart colour: teal, checked for chroma and contrast on white
const MARK_HOVER = '#006F79';

/* ─── Data loading: keeps the last result on screen while it refetches ───── */
function useAdmin(path) {
  const { token } = useAuth();
  const [nonce, setNonce] = useState(0);
  const key = `${path}#${nonce}`;
  const [res, setRes] = useState({ key: null, data: null, error: null });
  useEffect(() => {
    let off = false;
    api(path, { token })
      .then(data => { if (!off) setRes({ key, data, error: null }); })
      .catch(err => { if (!off) setRes(r => ({ key, data: r.data, error: err.message })); });
    return () => { off = true; };
  }, [path, token, key]);
  return { data: res.data, error: res.error, loading: res.key !== key, reload: () => setNonce(n => n + 1) };
}

async function downloadCsv(what, token) {
  const res = await fetch(`${BACKEND_URL}/api/admin/export/${what}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Export failed (${res.status}).`);
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `internpulse-${what}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ─── Building blocks ─────────────────────────────────────────────────────── */
const btn = 'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-50';
const btnPrimary = `${btn} bg-[#06525C] border-[#06525C] text-white hover:bg-[#043F47]`;
const btnPlain = `${btn} bg-white border-[#C3D4D2] text-[#06525C] hover:border-[#06525C]`;
const inputCls = 'rounded-lg border border-[#C3D4D2] bg-white px-3 py-2 text-sm text-[#06525C] placeholder:text-[#5E8D93] focus:outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/15';

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`bg-white border border-[#D5E1DF] rounded-2xl p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            {title && <h2 className="text-base font-bold text-[#06525C]">{title}</h2>}
            {subtitle && <p className="text-xs text-[#2F737D] mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function StatTile({ label, value, sub }) {
  return (
    <div className="bg-white border border-[#D5E1DF] rounded-2xl p-4">
      <p className="text-xs font-medium text-[#2F737D]">{label}</p>
      <p className="text-2xl font-semibold text-[#06525C] mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[#5E8D93] mt-1">{sub}</p>}
    </div>
  );
}

function ErrorNote({ error, onRetry }) {
  if (!error) return null;
  return (
    <div role="alert" className="mb-4 flex items-center gap-3 rounded-xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
      <span className="flex-1">{error}</span>
      {onRetry && <button onClick={onRetry} className="font-semibold underline underline-offset-2">Try again</button>}
    </div>
  );
}

/** Clean round numbers for a y axis that reaches at least `max`. */
function niceMax(max) {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].map(s => s * pow).find(s => s * 4 >= max) || pow * 10;
  return step * 4;
}

/** Daily visitors as columns; hover or focus a day for its visitors and page views. */
function DailyChart({ daily }) {
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);
  const top = niceMax(Math.max(0, ...daily.map(d => d.visitors)));
  const ticks = [top, top * 0.75, top / 2, top / 4, 0];
  const labelEvery = Math.ceil(daily.length / 8);
  const h = daily[hover];

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button onClick={() => setTable(t => !t)} className="text-xs font-semibold text-[#06525C] underline underline-offset-2">
          {table ? 'Show chart' : 'Show as table'}
        </button>
      </div>
      {table ? (
        <div className="max-h-72 overflow-auto rounded-lg border border-[#EBF0EE]">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F9F8] text-[#2F737D] text-xs sticky top-0"><tr><th className="text-left px-3 py-2">Day</th><th className="text-right px-3 py-2">Visitors</th><th className="text-right px-3 py-2">Page views</th></tr></thead>
            <tbody>{[...daily].reverse().map(d => (
              <tr key={d.date} className="border-t border-[#EBF0EE]"><td className="px-3 py-1.5 text-[#06525C]">{fmtDay(d.date)}</td><td className="px-3 py-1.5 text-right tabular-nums">{fmtNum(d.visitors)}</td><td className="px-3 py-1.5 text-right tabular-nums text-[#2F737D]">{fmtNum(d.views)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="relative" onMouseLeave={() => setHover(null)}>
          <div className="flex">
            <div className="w-10 h-52 flex flex-col justify-between text-[11px] text-[#5E8D93] tabular-nums pr-2 text-right -my-[7px]" aria-hidden="true">
              {ticks.map(t => <span key={t}>{fmtNum(t)}</span>)}
            </div>
            <div className="relative flex-1 h-52 border-b border-[#C3D4D2]">
              {[0, 25, 50, 75].map(p => <div key={p} className="absolute inset-x-0 h-px bg-[#EBF0EE]" style={{ top: `${p}%` }} />)}
              <div className="absolute inset-0 flex items-end gap-[2px]">
                {daily.map((d, i) => (
                  <button key={d.date} type="button"
                    onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                    aria-label={`${fmtDay(d.date)}: ${d.visitors} visitors, ${d.views} page views`}
                    className="relative flex-1 h-full flex items-end justify-center focus:outline-none">
                    <span className="block w-full rounded-t-[4px] transition-colors"
                      style={{ maxWidth: 24, height: `${(d.visitors / top) * 100}%`, background: hover === i ? MARK_HOVER : MARK }} />
                  </button>
                ))}
              </div>
              {h && (
                <>
                  <div className="absolute inset-y-0 w-px bg-[#2F737D]/30 pointer-events-none" style={{ left: `${((hover + 0.5) / daily.length) * 100}%` }} />
                  <div role="status" className="absolute top-1 z-10 pointer-events-none bg-white border border-[#D5E1DF] rounded-lg shadow-md px-3 py-2 text-xs whitespace-nowrap"
                    style={{ left: `${((hover + 0.5) / daily.length) * 100}%`, transform: hover > daily.length / 2 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)' }}>
                    <p className="text-[#2F737D] mb-1">{fmtDay(h.date)}</p>
                    <p className="flex items-center gap-2"><span className="w-3 h-0.5 rounded" style={{ background: MARK }} /><b className="text-sm text-[#06525C] tabular-nums">{fmtNum(h.visitors)}</b> <span className="text-[#2F737D]">visitors</span></p>
                    <p className="text-[#2F737D] mt-0.5 pl-5"><b className="text-[#06525C] tabular-nums">{fmtNum(h.views)}</b> page views</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex ml-10 mt-1.5 text-[11px] text-[#5E8D93]" aria-hidden="true">
            {daily.map((d, i) => (
              <span key={d.date} className="flex-1 text-center whitespace-nowrap overflow-visible">
                {/* every few days and the last day, never two labels close enough to touch */}
                {i === daily.length - 1 || (i % labelEvery === 0 && daily.length - 1 - i >= labelEvery) ? fmtDay(d.date) : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** A ranked list: label, value at the bar's tip. */
function RankBars({ rows, getLabel = r => r.key, getValue = r => r.visitors, unit = 'visitors', empty = 'No data yet.' }) {
  if (!rows?.length) return <p className="text-sm text-[#5E8D93]">{empty}</p>;
  const max = Math.max(1, ...rows.map(getValue));
  return (
    <ul className="space-y-2.5">
      {rows.map(r => (
        <li key={getLabel(r)} title={`${getLabel(r)}: ${getValue(r)} ${unit}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-[#06525C]">{getLabel(r)}</span>
            <span className="tabular-nums text-[#2F737D] shrink-0">{fmtNum(getValue(r))}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-r-[4px] bg-[#EBF0EE]">
            <div className="h-full rounded-r-[4px]" style={{ width: `${(getValue(r) / max) * 100}%`, background: MARK }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RangePicker({ days, setDays }) {
  return (
    <div role="group" aria-label="Date range" className="inline-flex p-1 rounded-xl bg-[#EBF0EE] border border-[#D5E1DF]">
      {[7, 30, 90].map(d => (
        <button key={d} onClick={() => setDays(d)} aria-pressed={days === d}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${days === d ? 'bg-white text-[#06525C] shadow-sm' : 'text-[#2F737D] hover:text-[#06525C]'}`}>
          Last {d} days
        </button>
      ))}
    </div>
  );
}

function Pager({ page, limit, total, setPage }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex items-center justify-between gap-3 mt-4 text-sm text-[#2F737D]">
      <span>{fmtNum(total)} in total · page {page} of {pages}</span>
      <div className="flex gap-2">
        <button className={btnPlain} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <button className={btnPlain} disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

/* ─── Sections ────────────────────────────────────────────────────────────── */
function Overview({ go }) {
  const o = useAdmin('/api/admin/overview');
  const t = useAdmin('/api/admin/traffic?days=30');
  const d = o.data;
  const run = d?.lastAlertRun;
  return (
    <div className={o.loading && d ? 'opacity-60 transition-opacity' : ''}>
      <ErrorNote error={o.error || t.error} onRetry={() => { o.reload(); t.reload(); }} />
      {!d ? <Skeleton /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
            <StatTile label="Visitors today" value={fmtNum(d.visitors.today)} sub={`${fmtNum(d.visitors.live)} on the site now`} />
            <StatTile label="Visitors, last 7 days" value={fmtNum(d.visitors.last7)} sub={`${fmtNum(d.pageViews.last7)} page views`} />
            <StatTile label="Visitors, last 30 days" value={fmtNum(d.visitors.last30)} sub={`${fmtNum(d.pageViews.last30)} page views`} />
            <StatTile label="Accounts" value={fmtNum(d.users.total)} sub={`${fmtNum(d.users.new7)} new this week`} />
            <StatTile label="Alert subscribers" value={fmtNum(d.subscribers.active)} sub={`${fmtNum(d.subscribers.total - d.subscribers.active)} paused · ${fmtNum(d.subscribers.new7)} new this week`} />
            <StatTile label="Saved by users" value={fmtNum(d.saved.bookmarked + d.saved.applied)} sub={`${fmtNum(d.saved.bookmarked)} bookmarks · ${fmtNum(d.saved.applied)} applied`} />
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <Panel title="Visitors per day" subtitle="Last 30 days, India time" className="lg:col-span-2"
              action={<button className={btnPlain} onClick={() => go('traffic')}>Full traffic report</button>}>
              {t.data ? <DailyChart daily={t.data.daily} /> : <div className="h-52 rounded-lg bg-[#F7F9F8] animate-pulse" />}
            </Panel>
            <Panel title="Most visited pages" subtitle="Last 30 days, by visitors">
              <RankBars rows={t.data?.pages?.slice(0, 7)} getLabel={r => PAGE_NAMES[r.key] || r.key} />
            </Panel>
            <Panel title="Job feed" action={<button className={btnPlain} onClick={() => go('system')}>Feed and alerts</button>}>
              <p className="text-2xl font-semibold text-[#06525C] tabular-nums">{fmtNum(d.jobs.count)}</p>
              <p className="text-sm text-[#2F737D]">listings, {fmtNum(d.jobs.internships)} of them internships</p>
              <p className="text-xs text-[#5E8D93] mt-2">Fetched {ago(d.jobs.lastFetchTime)}</p>
            </Panel>
            <Panel title="Last alert run" className="lg:col-span-2">
              {run ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-xs text-[#2F737D]">When</p><p className="font-semibold text-[#06525C]">{fmtTime(run.startedAt)}</p></div>
                  <div><p className="text-xs text-[#2F737D]">New jobs found</p><p className="font-semibold text-[#06525C] tabular-nums">{fmtNum(run.newJobs)}</p></div>
                  <div><p className="text-xs text-[#2F737D]">Emails sent</p><p className="font-semibold text-[#06525C] tabular-nums">{fmtNum(run.sent)} of {fmtNum(run.due)} due</p></div>
                  <div><p className="text-xs text-[#2F737D]">Failed</p><p className={`font-semibold tabular-nums ${run.failed ? 'text-[#B42318]' : 'text-[#06525C]'}`}>{fmtNum(run.failed)}</p></div>
                  {run.error && <p className="col-span-full text-[#B42318]">{run.error}</p>}
                </div>
              ) : <p className="text-sm text-[#5E8D93]">No alert run recorded yet. The first one runs at the top of the next hour.</p>}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Traffic() {
  const [days, setDays] = useState(30);
  const t = useAdmin(`/api/admin/traffic?days=${days}`);
  const d = t.data;
  const perVisitor = d && d.totals.visitors ? (d.totals.views / d.totals.visitors).toFixed(1) : '0';
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <RangePicker days={days} setDays={setDays} />
        <p className="text-xs text-[#5E8D93]">Days run midnight to midnight, India time. Bots and your own local testing are not counted.</p>
      </div>
      <ErrorNote error={t.error} onRetry={t.reload} />
      {!d ? <Skeleton /> : (
        <div className={t.loading ? 'opacity-60 transition-opacity' : ''}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            <StatTile label="Visitors" value={fmtNum(d.totals.visitors)} sub={`${fmtNum(d.totals.newVisitors)} new · ${fmtNum(d.totals.returningVisitors)} returning`} />
            <StatTile label="Page views" value={fmtNum(d.totals.views)} />
            <StatTile label="Visits" value={fmtNum(d.totals.sessions)} sub="Browser sessions" />
            <StatTile label="Pages per visitor" value={perVisitor} />
            <StatTile label="Came from other sites" value={fmtNum(d.totals.visitors - d.directVisitors)} sub={`${fmtNum(d.directVisitors)} typed the address or used a bookmark`} />
          </div>
          <Panel title="Visitors per day" subtitle={`Last ${days} days`} className="mb-4">
            <DailyChart daily={d.daily} />
          </Panel>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Panel title="Pages" subtitle="By visitors"><RankBars rows={d.pages} getLabel={r => PAGE_NAMES[r.key] || r.key} /></Panel>
            <Panel title="Where visitors came from" subtitle="Other sites that linked here">
              <RankBars rows={d.referrers} empty="No visits from other sites yet." />
            </Panel>
            <Panel title="Devices"><RankBars rows={d.devices} /></Panel>
            <Panel title="Browsers"><RankBars rows={d.browsers} /></Panel>
            <Panel title="Operating systems"><RankBars rows={d.os} /></Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function Users() {
  const { token, user: me } = useAuth();
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [msg, setMsg] = useState('');
  const r = useAdmin(`/api/admin/users?page=${page}&limit=25&q=${encodeURIComponent(query)}`);

  const act = async (fn, done) => {
    setMsg('');
    try { await fn(); setMsg(done); r.reload(); } catch (err) { setMsg(err.message); }
  };

  return (
    <Panel title="Accounts" subtitle="People who signed up. Passwords are never shown or stored readable."
      action={<button className={btnPlain} onClick={() => act(() => downloadCsv('users', token), 'Download started.')}>Download CSV</button>}>
      <form onSubmit={e => { e.preventDefault(); setPage(1); setQuery(q.trim()); }} className="flex gap-2 mb-4">
        <input className={`${inputCls} flex-1`} type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email or name" aria-label="Search accounts" />
        <button className={btnPrimary}>Search</button>
      </form>
      {msg && <p role="status" className="mb-3 text-sm text-[#2F737D]">{msg}</p>}
      <ErrorNote error={r.error} onRetry={r.reload} />
      <div className={`overflow-x-auto ${r.loading ? 'opacity-60' : ''}`}>
        <table className="w-full text-sm min-w-[760px]">
          <thead className="text-xs text-[#2F737D] bg-[#F7F9F8]">
            <tr>{['Email', 'Name', 'Sign-in', 'Joined', 'Last sign-in', 'Saved', ''].map(h => <th key={h} className="text-left font-semibold px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {r.data?.items.map(u => (
              <tr key={u.id} className="border-t border-[#EBF0EE] align-top">
                <td className="px-3 py-2 text-[#06525C] font-medium break-all">{u.email}{u.role === 'admin' && <span className="ml-2 text-[10px] font-bold uppercase text-white bg-[#06525C] rounded px-1.5 py-0.5">Admin</span>}{u.locked && <span className="ml-2 text-[10px] font-bold uppercase text-[#B42318] bg-[#FEF3F2] rounded px-1.5 py-0.5">Locked</span>}</td>
                <td className="px-3 py-2 text-[#2F737D]">{u.name || '—'}</td>
                <td className="px-3 py-2 text-[#2F737D]">{u.method}</td>
                <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap">{ago(u.lastLoginAt)}</td>
                <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap tabular-nums">{u.bookmarked} bookmarked · {u.applied} applied</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {u.locked && <button className="text-xs font-semibold text-[#06525C] underline mr-3" onClick={() => act(() => api(`/api/admin/users/${u.id}/unlock`, { method: 'POST', token }), `${u.email} can sign in again.`)}>Unlock</button>}
                  {u.role !== 'admin' && u.id !== me.id && (confirm === u.id ? (
                    <span className="inline-flex items-center gap-2 text-xs">
                      <span className="text-[#B42318]">Delete account and saved items?</span>
                      <button className="font-semibold text-white bg-[#B42318] rounded px-2 py-1" onClick={() => { setConfirm(null); act(() => api(`/api/admin/users/${u.id}`, { method: 'DELETE', token }), `${u.email} was deleted.`); }}>Delete</button>
                      <button className="font-semibold text-[#06525C]" onClick={() => setConfirm(null)}>Cancel</button>
                    </span>
                  ) : <button className="text-xs font-semibold text-[#B42318] underline" onClick={() => setConfirm(u.id)}>Delete</button>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {r.data && !r.data.items.length && <p className="text-sm text-[#5E8D93] px-3 py-6 text-center">{query ? 'No account matches that search.' : 'No one has signed up yet.'}</p>}
      </div>
      {r.data && <Pager page={page} limit={25} total={r.data.total} setPage={setPage} />}
    </Panel>
  );
}

function Subscribers() {
  const { token } = useAuth();
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');
  const r = useAdmin(`/api/admin/subscribers?page=${page}&limit=25&status=${status}&q=${encodeURIComponent(query)}`);

  const toggle = async s => {
    setMsg('');
    try {
      await api(`/api/admin/subscribers/${s.id}`, { method: 'PATCH', token, body: { active: !s.active } });
      setMsg(`${s.email}: alerts ${s.active ? 'paused' : 'resumed'}.`);
      r.reload();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <Panel title="Job alert subscribers" subtitle="Everyone on the email alert list, newest first."
      action={<button className={btnPlain} onClick={() => downloadCsv('subscribers', token).catch(err => setMsg(err.message))}>Download CSV</button>}>
      <form onSubmit={e => { e.preventDefault(); setPage(1); setQuery(q.trim()); }} className="flex flex-wrap gap-2 mb-4">
        <input className={`${inputCls} flex-1 min-w-[200px]`} type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email" aria-label="Search subscribers" />
        <select className={inputCls} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          <option value="all">All</option><option value="active">Receiving alerts</option><option value="inactive">Paused or unsubscribed</option>
        </select>
        <button className={btnPrimary}>Search</button>
      </form>
      {msg && <p role="status" className="mb-3 text-sm text-[#2F737D]">{msg}</p>}
      <ErrorNote error={r.error} onRetry={r.reload} />
      <div className={`overflow-x-auto ${r.loading ? 'opacity-60' : ''}`}>
        <table className="w-full text-sm min-w-[820px]">
          <thead className="text-xs text-[#2F737D] bg-[#F7F9F8]">
            <tr>{['Email', 'Status', 'How often', 'Interests', 'Subscribed', 'Last alert', 'Alerts sent', ''].map(h => <th key={h} className="text-left font-semibold px-3 py-2">{h}</th>)}</tr>
          </thead>
          <tbody>
            {r.data?.items.map(s => (
              <tr key={s.id} className="border-t border-[#EBF0EE] align-top">
                <td className="px-3 py-2 text-[#06525C] font-medium break-all">{s.email}</td>
                <td className="px-3 py-2"><span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${s.active ? 'bg-[#ECFDF3] text-[#067647]' : 'bg-[#F7F9F8] text-[#2F737D]'}`}>{s.active ? '● Active' : '○ Paused'}</span></td>
                <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap">{FREQ[s.frequency] || s.frequency}</td>
                <td className="px-3 py-2 text-[#2F737D]">{s.interests.join(', ') || '—'}</td>
                <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap">{fmtDate(s.createdAt)}</td>
                <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap">{ago(s.lastAlertSentAt)}</td>
                <td className="px-3 py-2 text-[#2F737D] tabular-nums">{s.alertCount}</td>
                <td className="px-3 py-2 text-right"><button className="text-xs font-semibold text-[#06525C] underline" onClick={() => toggle(s)}>{s.active ? 'Pause' : 'Resume'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {r.data && !r.data.items.length && <p className="text-sm text-[#5E8D93] px-3 py-6 text-center">No subscriber matches.</p>}
      </div>
      {r.data && <Pager page={page} limit={25} total={r.data.total} setPage={setPage} />}
    </Panel>
  );
}

function SavedReport() {
  const r = useAdmin('/api/admin/saved');
  const label = i => (i.data?.title ? `${i.data.title} · ${i.data.company || ''}` : i.data?.name || i.itemId);
  const rows = list => (list || []).map(i => ({ ...i, total: i.bookmarked + i.applied }));
  return (
    <div>
      <ErrorNote error={r.error} onRetry={r.reload} />
      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Most saved jobs" subtitle="Bookmarks plus applications, across all accounts">
          <RankBars rows={rows(r.data?.jobs)} getLabel={label} getValue={i => i.total} unit="saves" empty="No jobs saved yet." />
        </Panel>
        <Panel title="Most saved companies" subtitle="Bookmarks plus applications, across all accounts">
          <RankBars rows={rows(r.data?.companies)} getLabel={label} getValue={i => i.total} unit="saves" empty="No companies saved yet." />
        </Panel>
      </div>
      <p className="text-xs text-[#5E8D93] mt-3">Counts only signed-in people; guests' saves stay in their own browsers.</p>
    </div>
  );
}

// What to do about a source in trouble, by what the server reported
function sourceAdvice(s) {
  if (!s.configured) return { tone: 'muted', text: s.key === 'jooble' ? 'Off: add a free JOOBLE_API_KEY (jooble.org/api/about)' : 'Off: no API key set' };
  if (/HTTP 401|HTTP 403/.test(s.error || '')) return { tone: 'bad', text: 'The key was refused: create new keys and update them on the server' };
  if (/HTTP 429/.test(s.error || '')) return { tone: 'bad', text: 'Over its request limit: it will recover when the quota resets' };
  if (s.error) return { tone: 'bad', text: `Failing (${s.error})${s.count ? '; showing its last good listings' : ''}` };
  if (!s.count) return { tone: 'warn', text: 'Answered with no listings' };
  return { tone: 'good', text: 'Working' };
}
const TONE = { good: 'text-[#067647]', warn: 'text-[#93370D]', bad: 'text-[#B42318]', muted: 'text-[#5E8D93]' };

function System() {
  const { token, user } = useAuth();
  const jobs = useAdmin('/api/admin/jobs');
  const alerts = useAdmin('/api/admin/alerts');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const j = jobs.data;
  const sources = useMemo(() => [...(j?.cache?.sources || [])].sort((a, b) => b.count - a.count), [j]);
  const troubled = sources.filter(s => s.configured && (s.error || !s.count));

  const run = async (what, fn) => {
    setBusy(what); setMsg('');
    try { setMsg(await fn()); } catch (err) { setMsg(err.message); } finally { setBusy(''); }
  };

  return (
    <div className="space-y-4">
      {msg && <p role="status" className="rounded-xl border border-[#B5D2D0] bg-[#E6F0EF] px-4 py-3 text-sm text-[#06424A]">{msg}</p>}
      <ErrorNote error={jobs.error || alerts.error} onRetry={() => { jobs.reload(); alerts.reload(); }} />
      <Panel title="Job feed" subtitle={j ? `Fetched ${ago(j.cache.lastFetchTime)}; refreshes every ${j.cache.cacheDurationMinutes} minutes` : 'Loading…'}
        action={<button className={btnPrimary} disabled={!!busy} onClick={() => run('refresh', async () => { const r = await api('/api/admin/jobs/refresh', { method: 'POST', token }); jobs.reload(); return `Feed refreshed: ${fmtNum(r.count)} listings.`; })}>{busy === 'refresh' ? 'Refreshing…' : 'Refresh feed now'}</button>}>
        {j && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <StatTile label="Listings" value={fmtNum(j.total)} />
              <StatTile label="In India" value={fmtNum(j.cache.indiaCount ?? 0)} />
              <StatTile label="Internships" value={fmtNum(j.internships)} />
              <StatTile label="Posted in the last day" value={fmtNum(j.newToday)} />
            </div>
            {troubled.length > 0 && (
              <p className="mb-4 rounded-lg border border-[#FEDF89] bg-[#FFFAEB] px-3 py-2 text-sm text-[#93370D]">
                ⚠ {troubled.map(s => s.label).join(', ')} {troubled.length === 1 ? 'is' : 'are'} not adding listings right now. The table below says why.
              </p>
            )}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-xs text-[#2F737D] bg-[#F7F9F8]">
                  <tr>{['Source', 'Listings', 'Status', 'Last fetched', 'Fetched every'].map(h => <th key={h} className="text-left font-semibold px-3 py-2">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {sources.map(s => {
                    const a = sourceAdvice(s);
                    return (
                      <tr key={s.key} className="border-t border-[#EBF0EE]">
                        <td className="px-3 py-2 font-medium text-[#06525C]">{s.label}</td>
                        <td className="px-3 py-2 tabular-nums text-[#2F737D]">{fmtNum(s.count)}</td>
                        <td className={`px-3 py-2 ${TONE[a.tone]}`}>{a.text}</td>
                        <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap">{s.configured ? ago(s.fetchedAt) : '—'}</td>
                        <td className="px-3 py-2 text-[#2F737D] whitespace-nowrap">{s.refreshMinutes >= 60 ? `${Math.round(s.refreshMinutes / 60)} h` : `${s.refreshMinutes} min`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs text-[#5E8D93] mt-2">Refresh feed now refetches the free sources; JSearch, Adzuna and Jooble keep their own schedule so their monthly quotas last.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">

              <div><h3 className="text-sm font-semibold text-[#06525C] mb-2">Work mode</h3><RankBars rows={j.workModes} getValue={r => r.count} unit="listings" /></div>
              <div><h3 className="text-sm font-semibold text-[#06525C] mb-2">Countries</h3><RankBars rows={j.countries} getValue={r => r.count} unit="listings" /></div>
            </div>
          </>
        )}
      </Panel>

      <Panel title="Email" subtitle="Checks that welcome emails and job alerts can go out"
        action={<button className={btnPlain} disabled={!!busy} onClick={() => run('mail', async () => {
          const r = await api('/api/admin/email/test', { method: 'POST', token });
          return r.testInbox ? `Sent to a test inbox, not a real one (no SMTP settings): ${r.previewUrl}` : `Test email sent to ${r.to}. If it is not in your inbox, look in spam.`;
        })}>{busy === 'mail' ? 'Sending…' : `Send a test email to ${user.email}`}</button>}>
        <p className="text-sm text-[#2F737D]">Alerts go out every hour from the server ({alerts.data?.schedule || '0 * * * *'}); each subscriber gets at most one email per their chosen frequency.</p>
      </Panel>

      <Panel title="Alert runs" subtitle="One row per hourly run, newest first (kept for a week)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-xs text-[#2F737D] bg-[#F7F9F8]">
              <tr>{['Started', 'Jobs checked', 'New jobs', 'Subscribers due', 'Emails sent', 'Failed', 'Note'].map(h => <th key={h} className="text-left font-semibold px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {alerts.data?.runs.map(run => (
                <tr key={run._id} className="border-t border-[#EBF0EE]">
                  <td className="px-3 py-2 text-[#06525C] whitespace-nowrap">{fmtTime(run.startedAt)}</td>
                  <td className="px-3 py-2 tabular-nums text-[#2F737D]">{fmtNum(run.jobs)}</td>
                  <td className="px-3 py-2 tabular-nums text-[#2F737D]">{fmtNum(run.newJobs)}</td>
                  <td className="px-3 py-2 tabular-nums text-[#2F737D]">{fmtNum(run.due)} of {fmtNum(run.subscribers)}</td>
                  <td className="px-3 py-2 tabular-nums text-[#2F737D]">{fmtNum(run.sent)}</td>
                  <td className={`px-3 py-2 tabular-nums ${run.failed ? 'text-[#B42318] font-semibold' : 'text-[#2F737D]'}`}>{fmtNum(run.failed)}</td>
                  <td className="px-3 py-2 text-[#2F737D]">{run.error || (run.finishedAt ? '' : 'Still running or stopped early')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {alerts.data && !alerts.data.runs.length && <p className="text-sm text-[#5E8D93] px-3 py-6 text-center">No runs recorded yet. The first is at the top of the next hour.</p>}
        </div>
      </Panel>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3" aria-busy="true">
      {[0, 1, 2, 3, 4, 5].map(n => <div key={n} className="h-24 rounded-2xl bg-[#EBF0EE] animate-pulse" />)}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'traffic',     label: 'Traffic' },
  { id: 'users',       label: 'Accounts' },
  { id: 'subscribers', label: 'Alert subscribers' },
  { id: 'saved',       label: 'Saved jobs' },
  { id: 'system',      label: 'Feed and alerts' },
];

export default function AdminPage({ onNavigate }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#06525C]">Admin</h1>
          <p className="text-sm text-[#2F737D] mt-1">Signed in as {user.email}. Everything else on the site works as usual from the menu above.</p>
        </div>
        <button className={btnPlain} onClick={() => onNavigate('jobs')}>Back to the job feed</button>
      </div>
      <div role="tablist" aria-label="Admin sections" className="flex gap-1 overflow-x-auto border-b border-[#D5E1DF] mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[#06525C] text-[#06525C]' : 'border-transparent text-[#2F737D] hover:text-[#06525C]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <Overview go={setTab} />}
      {tab === 'traffic' && <Traffic />}
      {tab === 'users' && <Users />}
      {tab === 'subscribers' && <Subscribers />}
      {tab === 'saved' && <SavedReport />}
      {tab === 'system' && <System />}
    </div>
  );
}
