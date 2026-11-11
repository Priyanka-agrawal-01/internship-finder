import { useState } from 'react';
import { ALL_SOURCES, styleOf } from '../lib/sources';

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5E8D93" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06525C" strokeWidth="2.2" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const XSmallIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5E8D93" strokeWidth="2.2" strokeLinecap="round"
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#5E8D93] group-hover:text-[#2F737D] transition-colors">
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
          active ? 'border-[#06525C] bg-[#06525C]' : 'border-[#C3D4D2] group-hover:border-[#06525C]'
        }`}>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
      </div>
      <span onClick={() => onChange(value)}
        className={`text-xs transition-colors flex-1 cursor-pointer ${active ? 'font-semibold text-[#06525C]' : 'text-[#2F737D] group-hover:text-[#06525C]'}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-semibold text-[#5E8D93]">{count}</span>
      )}
    </label>
  );
}


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
    <div className="bg-white rounded-2xl border border-[#D5E1DF] p-5 sticky top-20"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilterIcon />
          <span className="text-sm font-bold text-[#06525C]">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold bg-[#06525C] text-white px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-[#06525C] hover:text-[#043F47] transition-colors">
            <XSmallIcon /> Clear
          </button>
        )}
      </div>

      <div className="space-y-5">

        {/* ── Search by role ─────────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5E8D93] mb-1.5">
            Role / Title
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="e.g. Frontend, ML, VLSI…"
              className="w-full border border-[#D5E1DF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#06525C] placeholder:text-[#5E8D93] outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/10 transition-all" />
          </div>
        </div>

        {/* ── Search by company ──────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5E8D93] mb-1.5">
            Company
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input type="text" value={companySearch} onChange={e => setCompanySearch(e.target.value)}
              placeholder="e.g. Google, Razorpay…"
              className="w-full border border-[#D5E1DF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#06525C] placeholder:text-[#5E8D93] outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/10 transition-all" />
          </div>
        </div>

        {/* ── Search by skills ──────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#5E8D93] mb-1.5">
            Skills / Tech Stack
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input type="text" value={skillsSearch} onChange={e => setSkillsSearch(e.target.value)}
              placeholder="e.g. React, Python, VLSI…"
              className="w-full border border-[#D5E1DF] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#06525C] placeholder:text-[#5E8D93] outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/10 transition-all" />
          </div>
        </div>

        <hr className="border-[#EBF0EE]"/>

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
              className="w-full bg-white border border-[#D5E1DF] text-[#06525C] text-xs rounded-xl px-3 py-2.5 pr-8 outline-none focus:border-[#06525C] transition-all cursor-pointer appearance-none">
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
            const s = styleOf(src);
            return (
              <label key={src} className="flex items-center gap-2.5 cursor-pointer py-0.5 group" onClick={() => setSelectedSource(src === selectedSource ? '' : src)}>
                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  selectedSource === src ? 'border-[#06525C] bg-[#06525C]' : 'border-[#C3D4D2] group-hover:border-[#06525C]'
                }`}>
                  {selectedSource === src && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }}/>
                  <span className={selectedSource === src ? 'font-semibold text-[#06525C]' : 'text-[#2F737D] group-hover:text-[#06525C]'}>{src}</span>
                </span>
              </label>
            );
          })}
        </Section>

      </div>
    </div>
  );
}
