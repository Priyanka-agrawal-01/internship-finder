import React, { useState, useMemo } from 'react';
import { IT_COMPANIES, ECE_COMPANIES } from '../data/companiesData';
import { getCompanyPrep } from '../data/prepData';

// ─── Colour helpers ───────────────────────────────────────────────────────────
function stipendColor(min) {
  if (min >= 120000) return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' };
  if (min >= 80000)  return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
  if (min >= 50000)  return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
  return               { bg: '#F8FAFC',  text: '#64748B', border: '#E2E8F0' };
}

// ─── Shared icons ─────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const MapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// ─── Company logo avatar ──────────────────────────────────────────────────────
function CompanyLogo({ name, color, size = 48 }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold text-white shrink-0 select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.3 }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ companies, tab }) {
  const total   = companies.length;
  const highest = Math.max(...companies.map(c => c.stipendMax));
  const avgMin  = Math.round(companies.reduce((a, c) => a + c.stipendMin, 0) / total);
  const product = companies.filter(c => c.category?.includes('Product-Based')).length;

  const fmt = (n) => n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : `₹${(n / 1000).toFixed(0)}k`;

  const stats = tab === 'it'
    ? [
        { label: 'Total Companies', value: total,       icon: '🏢' },
        { label: 'Highest Stipend', value: fmt(highest), icon: '💰' },
        { label: 'Avg. Min Stipend',value: fmt(avgMin),  icon: '📊' },
        { label: 'Product-Based',   value: product,      icon: '🚀' },
      ]
    : [
        { label: 'ECE Companies',   value: total,       icon: '🔌' },
        { label: 'Highest Stipend', value: fmt(highest), icon: '💰' },
        { label: 'Avg. Min Stipend',value: fmt(avgMin),  icon: '📊' },
        { label: 'Semiconductor',   value: companies.filter(c => c.category?.includes('Semiconductor')).length, icon: '🧠' },
      ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className="text-xl font-bold text-[#0F172A]">{s.value}</div>
          <div className="text-xs text-[#64748B] mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Featured carousel ────────────────────────────────────────────────────────
const FEATURED_IT  = ['Google','Microsoft','Amazon','Adobe','ServiceNow','Uber','LinkedIn','DE Shaw','Tower Research','Atlassian'];
const FEATURED_ECE = ['Qualcomm','Intel','AMD','Cadence','Synopsys','Broadcom','Texas Instruments','Marvell','MediaTek','Nokia'];

function FeaturedCarousel({ companies, onSelect }) {
  const featured = companies.filter(c => (
    FEATURED_IT.includes(c.name) || FEATURED_ECE.includes(c.name)
  ));
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Featured Companies</p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {featured.map((c) => {
          const sc = stipendColor(c.stipendMin);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="shrink-0 flex flex-col items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 hover:border-[#2563EB] hover:shadow-hover transition-all"
              style={{ minWidth: 110 }}
            >
              <CompanyLogo name={c.name} color={c.color} size={40} />
              <span className="text-xs font-semibold text-[#0F172A] text-center leading-tight">{c.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                {c.stipend}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Company card ─────────────────────────────────────────────────────────────
function CompanyCard({ company, onSelect }) {
  const sc = stipendColor(company.stipendMin);
  return (
    <div
      className="job-card bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col cursor-pointer"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      onClick={() => onSelect(company)}
    >
      {/* Top */}
      <div className="flex items-start gap-3 mb-3">
        <CompanyLogo name={company.name} color={company.color} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#0F172A] leading-tight">{company.name}</h3>
          {company.domain && (
            <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{company.domain}</p>
          )}
        </div>
        {/* Stipend badge */}
        <span
          className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap"
          style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
        >
          {company.stipend}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 mb-3 flex-1">
        {company.description}
      </p>

      {/* Locations */}
      {company.location?.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-3">
          <MapPin />
          {company.location.map(l => (
            <span key={l} className="text-[11px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-md">{l}</span>
          ))}
        </div>
      )}

      {/* Category tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {company.category?.map(cat => (
          <span key={cat} className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-full">
            {cat}
          </span>
        ))}
      </div>

      {/* Button */}
      <a
        href={company.careers}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition-colors"
      >
        Visit Careers Page <ExternalIcon />
      </a>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
// ─── Modal ───────────────────────────────────────────────────────────────────
function CompanyModal({ company, tab, onClose }) {
  if (!company) return null;
  const sc = stipendColor(company.stipendMin);
  const prep = getCompanyPrep(company.id, tab);
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'prep'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-4">
            <CompanyLogo name={company.name} color={company.color} size={52} />
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">{company.name}</h2>
              {company.domain && <p className="text-xs text-[#94A3B8] mt-0.5">{company.domain}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors ml-2 shrink-0">
            <CloseIcon />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#E2E8F0] px-6 bg-[#F8FAFC]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            📋 Overview
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'prep'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            🎯 Prep Hub
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="p-6 space-y-5">
            {/* Stipend */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Internship Stipend</p>
              <span
                className="text-sm font-bold px-3 py-1.5 rounded-lg border inline-block"
                style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
              >
                {company.stipend} / month
              </span>
            </div>

            {/* Description */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">About</p>
              <p className="text-sm text-[#64748B] leading-relaxed">{company.description}</p>
            </div>

            {/* Locations */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Hiring Locations</p>
              <div className="flex flex-wrap gap-2">
                {company.location?.map(l => (
                  <div key={l} className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5">
                    <MapPin /><span className="text-xs font-medium text-[#0F172A]">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Common Internship Roles</p>
              <div className="flex flex-wrap gap-2">
                {company.roles?.map(r => (
                  <span key={r} className="text-xs font-medium text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1.5 rounded-lg">{r}</span>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {company.category?.map(c => (
                  <span key={c} className="text-xs font-semibold text-[#22C55E] bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1.5 rounded-lg">{c}</span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a
              href={company.careers}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl transition-colors mt-2"
            >
              Visit Careers Page <ExternalIcon />
            </a>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">Company Preparation Hub</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Curated insights from candidate experiences, blog posts, and hiring guidelines.
              </p>
            </div>

            {/* Resume Strategy */}
            {prep.resumeStrategy && (
              <div className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  📝 Resume Strategy
                </h4>

                <div className="space-y-3.5 text-xs text-[#475569]">
                  <div>
                    <span className="font-bold text-[#0F172A]">Preferred Resume Length: </span>
                    <span className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded-md font-medium text-[#64748B]">
                      {prep.resumeStrategy.preferredLength}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1.5">Commonly Valued Technical Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {prep.resumeStrategy.keySkills?.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] rounded-lg font-semibold text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-[#0F172A] block mb-1.5">Preferred Project Types:</span>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[#64748B]">
                      {prep.resumeStrategy.preferredProjects?.map((proj, i) => (
                        <li key={i} className="leading-relaxed">{proj}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-[#0F172A] block mb-2">Achievement-Based Bullet Point Examples:</span>
                    <div className="space-y-2">
                      {prep.resumeStrategy.bulletExamples?.map((bullet, i) => (
                        <div key={i} className="p-3 bg-white border border-[#E2E8F0] border-l-4 border-l-[#10B981] rounded-r-xl text-xs font-mono text-[#334155] leading-relaxed shadow-sm">
                          "{bullet}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-[#DC2626] block mb-1.5">Common Mistakes to Avoid:</span>
                    <ul className="space-y-1.5 pl-0.5">
                      {prep.resumeStrategy.commonMistakes?.map((mistake, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#64748B] leading-relaxed">
                          <span className="text-[#DC2626] shrink-0 mt-0.5">⚠️</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Expected */}
            {prep.skills && (
              <div className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
                <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  🛠️ Skills Expected & Importance
                </h4>

                <div className="divide-y divide-[#E2E8F0] space-y-3">
                  {Object.entries(prep.skills).map(([skillKey, item]) => {
                    const labelMap = {
                      frontend: 'Frontend Development',
                      backend: 'Backend Development',
                      dsa: 'Data Structures & Algorithms (DSA)',
                      database: 'Database & SQL',
                      cloud: 'Cloud Computing',
                      devops: 'DevOps & CI/CD',
                      systemDesign: 'System Design',
                    };
                    const label = labelMap[skillKey] || skillKey;

                    let badgeStyle = { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0', label: 'Low' };
                    if (item.level?.toLowerCase() === 'high' || item.level?.toLowerCase() === 'h') {
                      badgeStyle = { bg: '#FEF2F2', text: '#EF4444', border: '#FCA5A5', label: 'High' };
                    } else if (item.level?.toLowerCase() === 'medium' || item.level?.toLowerCase() === 'm') {
                      badgeStyle = { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', label: 'Medium' };
                    }

                    return (
                      <div key={skillKey} className="pt-3 first:pt-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-[#0F172A]">{label}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text, borderColor: badgeStyle.border }}>
                            {badgeStyle.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed pl-1">{item.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interview Focus */}
            {prep.interviewFocus && (
              <div className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  🎯 Interview Focus Areas
                </h4>
                <div className="flex flex-wrap gap-2 pl-0.5">
                  {prep.interviewFocus.map((focus, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#334155] shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hiring Process */}
            {prep.hiringProcess && (
              <div className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  🔄 Hiring Process
                </h4>
                <div className="relative border-l-2 border-[#CBD5E1] ml-3 pl-4 space-y-4 py-1">
                  {prep.hiringProcess.map((step, i) => (
                    <div key={i} className="relative text-xs">
                      <div className="absolute -left-[22px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#2563EB] border-2 border-white ring-4 ring-[#EFF6FF]" />
                      <span className="font-extrabold text-[#0F172A] block mb-0.5">Stage {i + 1}</span>
                      <span className="text-[#64748B] leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Ideas */}
            {prep.projectIdeas && (
              <div className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
                <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  💡 Suggested Portfolio Projects
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {prep.projectIdeas.map((idea, i) => (
                    <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-sm space-y-1.5">
                      <h5 className="text-xs font-extrabold text-[#2563EB]">{idea.title}</h5>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        <span className="font-semibold text-[#475569]">Why it works:</span> {idea.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scorecard */}
            {prep.scorecard && (
              <div className="bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5">
                <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  ✅ Preparation Scorecard
                </h4>
                <div className="grid grid-cols-1 gap-2.5 pl-0.5">
                  {prep.scorecard.map((item, i) => (
                    <label key={i} className="flex items-start gap-2.5 text-xs text-[#64748B] cursor-pointer hover:text-[#0F172A] transition-colors leading-relaxed">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]/25"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Filter chips ─────────────────────────────────────────────────────────────
const IT_FILTERS  = ['All','Product-Based','Finance','Startup'];
const ECE_FILTERS = ['All','Semiconductor','VLSI','Embedded Systems','Networking','Telecommunications'];

function FilterChips({ options, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            active === opt
              ? 'bg-[#2563EB] text-white border-[#2563EB]'
              : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main CompaniesPage ───────────────────────────────────────────────────────
export default function CompaniesPage() {
  const [tab,        setTab]        = useState('it');    // 'it' | 'ece'
  const [search,     setSearch]     = useState('');
  const [sort,       setSort]       = useState('alpha'); // 'alpha' | 'high' | 'low'
  const [filter,     setFilter]     = useState('All');
  const [modal,      setModal]      = useState(null);

  const baseList = tab === 'it' ? IT_COMPANIES : ECE_COMPANIES;
  const filterOptions = tab === 'it' ? IT_FILTERS : ECE_FILTERS;

  // Reset filter when switching tabs
  const switchTab = (t) => { setTab(t); setFilter('All'); setSearch(''); };

  const displayed = useMemo(() => {
    let list = [...baseList];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location?.some(l => l.toLowerCase().includes(q)) ||
        c.domain?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filter !== 'All') {
      list = list.filter(c => c.category?.includes(filter));
    }

    // Sort
    if (sort === 'high')  list.sort((a, b) => b.stipendMax - a.stipendMax);
    else if (sort === 'low')  list.sort((a, b) => a.stipendMin - b.stipendMin);
    else list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [baseList, search, filter, sort]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Page hero ── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-3">
                <span className="text-xs font-bold text-[#2563EB]">🎓 Placement Portal</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">Companies Directory</h1>
              <p className="text-[#64748B] mt-2 max-w-xl">
                Browse {IT_COMPANIES.length + ECE_COMPANIES.length} verified companies with stipend ranges, hiring locations, and direct career links.
              </p>
            </div>
            {/* Tab switcher */}
            <div className="flex bg-[#F1F5F9] p-1 rounded-xl shrink-0 self-start sm:self-auto">
              {[
                { value: 'it',  label: '💻 IT Companies',  count: IT_COMPANIES.length },
                { value: 'ece', label: '🔌 ECE Companies', count: ECE_COMPANIES.length },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => switchTab(t.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === t.value
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {t.label}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    tab === t.value ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#E2E8F0] text-[#64748B]'
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Stats */}
        <StatsBar companies={baseList} tab={tab} />

        {/* Featured carousel */}
        <FeaturedCarousel companies={baseList} onSelect={setModal} />

        {/* Toolbar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex flex-col gap-4">
            {/* Search + sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={tab === 'it' ? 'Search company, tech, location…' : 'Search company, domain, location…'}
                  className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
                />
              </div>
              {/* Sort */}
              <div className="relative sm:w-52">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-[#0F172A] bg-white outline-none focus:border-[#2563EB] cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%2394A3B8' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <option value="alpha">Sort: A → Z</option>
                  <option value="high">Highest Stipend</option>
                  <option value="low">Lowest Stipend</option>
                </select>
              </div>
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#64748B] shrink-0">Filter:</span>
              <FilterChips options={filterOptions} active={filter} onChange={setFilter} />
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#64748B]">
            Showing <span className="font-bold text-[#0F172A]">{displayed.length}</span> of {baseList.length} companies
          </p>
          {(search || filter !== 'All') && (
            <button onClick={() => { setSearch(''); setFilter('All'); }} className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-[#0F172A] mb-1">No companies found</h3>
            <p className="text-sm text-[#64748B]">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(c => (
              <CompanyCard key={c.id} company={c} onSelect={setModal} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && <CompanyModal company={modal} tab={tab} onClose={() => setModal(null)} />}
    </div>
  );
}
