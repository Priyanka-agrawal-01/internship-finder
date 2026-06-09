import React, { useState } from 'react';

/* ─── Source badge colours ──────────────────────────────────────────────────── */
const SOURCE_STYLES = {
  'Remotive':    { bg:'#FDF4FF', text:'#9333EA', border:'#E9D5FF' },
  'Arbeitnow':  { bg:'#F0FDF4', text:'#16A34A', border:'#BBF7D0' },
  'The Muse':   { bg:'#FFF1F2', text:'#E11D48', border:'#FECDD3' },
  'Adzuna':     { bg:'#FFF7ED', text:'#EA580C', border:'#FED7AA' },
  'JSearch':    { bg:'#ECFDF5', text:'#059669', border:'#A7F3D0' },
  'InternPulse':{ bg:'#EFF6FF', text:'#2563EB', border:'#BFDBFE' },
};

const WORK_MODE_STYLES = {
  'Remote':  { bg:'#F0FDF4', text:'#16A34A', border:'#BBF7D0', label:'🌐 Remote'  },
  'Hybrid':  { bg:'#FFF7ED', text:'#EA580C', border:'#FED7AA', label:'🏢 Hybrid'  },
  'On-site': { bg:'#F8FAFC', text:'#64748B', border:'#E2E8F0', label:'📍 On-site' },
};

/* ─── Time ago helper ──────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return 'Yesterday';
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d/7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

/* ─── Company logo with fallback ────────────────────────────────────────────── */
function CompanyLogo({ company = '', logoUrl, size = 44 }) {
  const [failed, setFailed] = useState(false);

  // Colour avatar fallback
  const COLOURS = [
    ['#EFF6FF','#2563EB'],['#F0FDF4','#16A34A'],['#FFF7ED','#EA580C'],
    ['#FDF4FF','#9333EA'],['#FFF1F2','#E11D48'],['#ECFDF5','#059669'],
    ['#F0F9FF','#0284C7'],['#FEFCE8','#CA8A04'],
  ];
  const [bg, fg] = COLOURS[(company.charCodeAt(0) || 0) % COLOURS.length];
  const initials = (company || '??').slice(0, 2).toUpperCase();

  if (logoUrl && !failed) {
    return (
      <img src={logoUrl} alt={company} onError={() => setFailed(true)}
        className="rounded-xl object-contain bg-white border border-[#E2E8F0]"
        style={{ width: size, height: size, padding: 4 }} />
    );
  }
  return (
    <div className="rounded-xl flex items-center justify-center font-extrabold shrink-0"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.33, border: `1px solid ${fg}25` }}>
      {initials}
    </div>
  );
}

/* ─── Main JobCard ───────────────────────────────────────────────────────────── */
export default function JobCard({ job }) {
  if (!job) return null;

  const src   = SOURCE_STYLES[job.source] ?? SOURCE_STYLES['InternPulse'];
  const wm    = WORK_MODE_STYLES[job.workMode] ?? WORK_MODE_STYLES['On-site'];
  const skills = (job.skills || job.tags || []).slice(0, 5);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col hover:border-[#CBD5E1] hover:shadow-md transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* ── Top row: logo + title + badges ────────────────── */}
      <div className="flex items-start gap-3 mb-3">
        <CompanyLogo company={job.company} logoUrl={job.logoUrl} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#0F172A] leading-snug line-clamp-2">{job.title}</h3>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">{job.company}</p>
            </div>
            {/* Verified badge */}
            {job.verifiedRecently && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] badge-new inline-block"/>
                Verified Recently
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Meta row: location, work mode, stipend ─────────── */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {/* Location */}
        <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2.5 py-1">
          📍 {job.location || 'India'}
        </span>

        {/* Work mode */}
        <span className="inline-flex items-center text-[11px] font-semibold rounded-full px-2.5 py-1 border"
          style={{ background: wm.bg, color: wm.text, borderColor: wm.border }}>
          {wm.label}
        </span>

        {/* Duration */}
        {job.duration && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2.5 py-1">
            ⏱ {job.duration}
          </span>
        )}

        {/* Stipend */}
        {job.stipend && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-2.5 py-1">
            💰 {job.stipend}
          </span>
        )}
      </div>

      {/* ── Skills/Tags ─────────────────────────────────────── */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skills.map(t => (
            <span key={t} className="px-2 py-0.5 text-[10px] font-semibold text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] rounded-md">
              {t}
            </span>
          ))}
          {(job.skills || job.tags || []).length > 5 && (
            <span className="px-2 py-0.5 text-[10px] text-[#94A3B8]">+{(job.skills || job.tags || []).length - 5}</span>
          )}
        </div>
      )}

      {/* ── Country chip (if not India) ──────────────────────── */}
      {job.country && job.country !== 'India' && (
        <div className="mb-3">
          <span className="text-[10px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2.5 py-1">
            🌍 {job.country}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1"/>

      {/* ── Footer: source + time + apply ────────────────────── */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F1F5F9] flex-wrap">
        {/* Source badge */}
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2.5 py-1"
          style={{ background: src.bg, color: src.text, borderColor: src.border }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: src.text }}/>
          {job.source}
        </span>

        {/* Posted time */}
        <span className="text-[11px] text-[#94A3B8]">{timeAgo(job.postedAt)}</span>

        {/* Spacer */}
        <div className="flex-1"/>

        {/* Internship badge */}
        {job.isInternship && (
          <span className="text-[10px] font-bold text-[#7C3AED] bg-[#F5F3FF] border border-[#DDD6FE] rounded-full px-2 py-0.5">
            🎓 Intern
          </span>
        )}
      </div>

      {/* ── Apply button ────────────────────────────────────── */}
      <a href={job.url || '#'} target="_blank" rel="noopener noreferrer"
        className={`mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 ${
          job.url ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-[#94A3B8] cursor-not-allowed'
        }`}>
        {job.url ? 'Apply Now →' : 'Link Unavailable'}
      </a>
    </div>
  );
}
