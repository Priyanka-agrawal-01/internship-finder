import React, { useState } from 'react';

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const XSmallIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

/* ─── Section header with collapse ─────────────────────────────────────────── */
function Section({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-2 group">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] group-hover:text-[#64748B] transition-colors">
          {label}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

/* ─── Radio option ──────────────────────────────────────────────────────────── */
function RadioOpt({ value, current, onChange, label, count }) {
  const active = value === current;
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <div onClick={() => onChange(value)}
        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
          active ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1] group-hover:border-[#2563EB]'
        }`}>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
      </div>
      <span onClick={() => onChange(value)}
        className={`text-xs transition-colors flex-1 cursor-pointer ${active ? 'font-semibold text-[#0F172A]' : 'text-[#64748B] group-hover:text-[#0F172A]'}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-semibold text-[#94A3B8]">{count}</span>
      )}
    </label>
  );
}

/* ─── Source badge colours ──────────────────────────────────────────────────── */
const SOURCE_STYLES = {
  'Remotive':    { bg:'#FDF4FF', text:'#9333EA', border:'#E9D5FF', dot:'#9333EA' },
  'Arbeitnow':  { bg:'#F0FDF4', text:'#16A34A', border:'#BBF7D0', dot:'#16A34A' },
  'The Muse':   { bg:'#FFF1F2', text:'#E11D48', border:'#FECDD3', dot:'#E11D48' },
  'Adzuna':     { bg:'#FFF7ED', text:'#EA580C', border:'#FED7AA', dot:'#EA580C' },
  'JSearch':    { bg:'#ECFDF5', text:'#059669', border:'#A7F3D0', dot:'#059669' },
  'InternPulse':{ bg:'#EFF6FF', text:'#2563EB', border:'#BFDBFE', dot:'#2563EB' },
};

/* ─── SOURCES list ──────────────────────────────────────────────────────────── */
const ALL_SOURCES = ['Remotive','Arbeitnow','The Muse','Adzuna','JSearch','InternPulse'];

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function SearchFilter({
  // search inputs
  searchTerm, setSearchTerm,
  companySearch, setCompanySearch,
  skillsSearch, setSkillsSearch,
  // select filters
  selectedSource, setSelectedSource,
  selectedCountry, setSelectedCountry,
  selectedWorkMode, setSelectedWorkMode,
  jobType, setJobType,
  // data
  countries = [],
  // reset
  onReset,
  // active count
  activeFilterCount = 0,
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-20"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilterIcon />
          <span className="text-sm font-bold text-[#0F172A]">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold bg-[#2563EB] text-white px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            <XSmallIcon /> Clear
          </button>
        )}
      </div>

      <div className="space-y-5">

        {/* ── Search by role ─────────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1.5">
            Role / Title
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="e.g. Frontend, ML, VLSI…"
              className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all" />
          </div>
        </div>

        {/* ── Search by company ──────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1.5">
            Company
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input type="text" value={companySearch} onChange={e => setCompanySearch(e.target.value)}
              placeholder="e.g. Google, Razorpay…"
              className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all" />
          </div>
        </div>

        {/* ── Search by skills ──────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1.5">
            Skills / Tech Stack
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input type="text" value={skillsSearch} onChange={e => setSkillsSearch(e.target.value)}
              placeholder="e.g. React, Python, VLSI…"
              className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all" />
          </div>
        </div>

        <hr className="border-[#F1F5F9]"/>

        {/* ── Internship type ────────────────────────────────── */}
        <Section label="Opening Type" defaultOpen={true}>
          {[
            { value:'all',        label:'All Positions'     },
            { value:'internship', label:'Internships Only'  },
          ].map(o => (
            <RadioOpt key={o.value} value={o.value} current={jobType} onChange={setJobType} label={o.label} />
          ))}
        </Section>

        {/* ── Work Mode ─────────────────────────────────────── */}
        <Section label="Work Mode" defaultOpen={true}>
          {[
            { value:'',        label:'Any Mode'   },
            { value:'Remote',  label:'🌐 Remote'  },
            { value:'Hybrid',  label:'🏢 Hybrid'  },
            { value:'On-site', label:'📍 On-site' },
          ].map(o => (
            <RadioOpt key={o.value} value={o.value} current={selectedWorkMode} onChange={setSelectedWorkMode} label={o.label} />
          ))}
        </Section>

        {/* ── Country ───────────────────────────────────────── */}
        <Section label="Country / Location" defaultOpen={true}>
          <div className="relative">
            <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] text-xs rounded-xl px-3 py-2.5 pr-8 outline-none focus:border-[#2563EB] transition-all cursor-pointer appearance-none">
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronIcon open={false} />
            </div>
          </div>
        </Section>

        {/* ── Source ────────────────────────────────────────── */}
        <Section label="Source" defaultOpen={false}>
          <RadioOpt value="" current={selectedSource} onChange={setSelectedSource} label="All Sources" />
          {ALL_SOURCES.map(src => {
            const s = SOURCE_STYLES[src] ?? SOURCE_STYLES['InternPulse'];
            return (
              <label key={src} className="flex items-center gap-2.5 cursor-pointer py-0.5 group" onClick={() => setSelectedSource(src === selectedSource ? '' : src)}>
                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  selectedSource === src ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1] group-hover:border-[#2563EB]'
                }`}>
                  {selectedSource === src && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }}/>
                  <span className={selectedSource === src ? 'font-semibold text-[#0F172A]' : 'text-[#64748B] group-hover:text-[#0F172A]'}>{src}</span>
                </span>
              </label>
            );
          })}
        </Section>

      </div>
    </div>
  );
}
