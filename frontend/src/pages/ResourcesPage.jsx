import React, { useState } from 'react';
import { RESOURCE_CATEGORIES } from '../data/resourcesData';

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

/* ─── Resource Card ─────────────────────────────────────────────────────────── */
function ResourceCard({ resource, categoryColor, categoryBg }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col hover:border-[#CBD5E1] hover:shadow-md transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {resource.featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEFCE8] text-[#A16207] border border-[#FDE68A]">
                <StarIcon /> Featured
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] text-[#94A3B8]">
              <ClockIcon /> {resource.readTime} read
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] leading-snug">{resource.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[#64748B] leading-relaxed mb-4 flex-1 line-clamp-3">
        {resource.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {resource.tags.map(t => (
          <span key={t} className="px-2 py-0.5 text-[10px] font-semibold rounded-full border"
            style={{ background: categoryBg, color: categoryColor, borderColor: categoryColor + '40' }}>
            {t}
          </span>
        ))}
      </div>

      {/* CTA */}
      <a href={resource.link} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200"
        style={{ background: categoryColor }}>
        Read More <ExternalIcon />
      </a>
    </div>
  );
}

/* ─── Category Section ──────────────────────────────────────────────────────── */
function CategorySection({ category, search }) {
  const filtered = category.resources.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));
  });

  if (filtered.length === 0) return null;

  return (
    <section id={category.id} className="mb-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: category.bg, border: `1px solid ${category.border}` }}>
          {category.emoji}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A]">{category.label}</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">{category.resources.length} resources</p>
        </div>
        <div className="flex-1 h-px bg-[#E2E8F0] ml-2"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => (
          <ResourceCard key={r.id} resource={r}
            categoryColor={category.color} categoryBg={category.bg} />
        ))}
      </div>
    </section>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function ResourcesPage() {
  const [search,   setSearch]   = useState('');
  const [activeId, setActiveId] = useState('all');

  const totalResources = RESOURCE_CATEGORIES.reduce((a, c) => a + c.resources.length, 0);

  const filteredCategories = activeId === 'all'
    ? RESOURCE_CATEGORIES
    : RESOURCE_CATEGORIES.filter(c => c.id === activeId);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
              <span className="text-xs font-bold text-[#2563EB]">📚 Student Preparation Hub</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Resources for Placement Success
            </h1>
            <p className="text-[#64748B] text-lg leading-relaxed">
              Curated guides for resume writing, DSA prep, development roadmaps, interview strategy, and career building — all in one place.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <span className="text-sm font-bold text-[#0F172A]">{totalResources} resources</span>
              <span className="text-[#E2E8F0]">·</span>
              <span className="text-sm text-[#64748B]">{RESOURCE_CATEGORIES.length} categories</span>
              <span className="text-[#E2E8F0]">·</span>
              <span className="text-sm text-[#64748B]">Free forever</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search resources, topics, tags…"
              className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all" />
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${activeId === 'all' ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]'}`}>
              All
            </button>
            {RESOURCE_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${activeId === c.id ? 'text-white border-transparent' : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
                style={activeId === c.id ? { background: c.color } : {}}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category Sections ─────────────────────────────────────────────── */}
        {filteredCategories.map(cat => (
          <CategorySection key={cat.id} category={cat} search={search} />
        ))}

        {/* Empty state */}
        {filteredCategories.every(c => {
          const q = search.toLowerCase();
          return c.resources.every(r =>
            !r.title.toLowerCase().includes(q) &&
            !r.description.toLowerCase().includes(q) &&
            !r.tags.some(t => t.toLowerCase().includes(q))
          );
        }) && search && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-[#0F172A] mb-1">No resources found</h3>
            <p className="text-sm text-[#64748B]">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
