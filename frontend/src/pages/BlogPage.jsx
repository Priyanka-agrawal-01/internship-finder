import { useState, useMemo } from 'react';
import { BLOG_POSTS, BLOG_CATEGORIES } from '../data/blogData';

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5E8D93" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5E8D93" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5E8D93" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);

/* ─── Category badge colours ──────────────────────────────────────────────── */
const CAT_STYLES = {
  'Resume':       { bg:'#E6F0EF', text:'#06525C', border:'#B5D2D0' },
  'Internships':  { bg:'#F0FDF4', text:'#16A34A', border:'#BBF7D0' },
  'DSA':          { bg:'#FEFCE8', text:'#A16207', border:'#FDE68A' },
  'Interview':    { bg:'#FFF7ED', text:'#EA580C', border:'#FED7AA' },
  'Career':       { bg:'#F0F9FF', text:'#0284C7', border:'#BAE6FD' },
  'Roadmap':      { bg:'#ECFDF5', text:'#059669', border:'#A7F3D0' },
  'Company Guide':{ bg:'#FFF1F2', text:'#E11D48', border:'#FECDD3' },
};
function CategoryBadge({ cat }) {
  const s = CAT_STYLES[cat] ?? { bg:'#F7F9F8', text:'#2F737D', border:'#D5E1DF' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background:s.bg, color:s.text, borderColor:s.border }}>
      {cat}
    </span>
  );
}

/* ─── Format date ────────────────────────────────────────────────────────────── */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
}

/* ─── Author avatar ─────────────────────────────────────────────────────────── */
function AuthorAvatar({ size = 32 }) {
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width:size, height:size, background:'linear-gradient(135deg,#06525C,#A16207)', fontSize:size*0.35 }}>
      PA
    </div>
  );
}

/* ─── Blog post card ─────────────────────────────────────────────────────────── */
function PostCard({ post, onOpen, featured = false }) {
  return (
    <div
      onClick={() => onOpen(post)}
      className={`bg-white border border-[#D5E1DF] rounded-2xl overflow-hidden cursor-pointer hover:border-[#C3D4D2] hover:shadow-md transition-all duration-200 flex flex-col ${featured ? 'lg:flex-row' : ''}`}
      style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Emoji banner */}
      <div className={`flex items-center justify-center text-4xl shrink-0 ${featured ? 'lg:w-52 p-8 bg-[#F7F9F8] border-b lg:border-b-0 lg:border-r border-[#D5E1DF]' : 'py-8 bg-[#F7F9F8] border-b border-[#D5E1DF]'}`}>
        {post.emoji}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.featured && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEFCE8] text-[#A16207] border border-[#FDE68A]">
              ⭐ Featured
            </span>
          )}
          <CategoryBadge cat={post.category} />
        </div>

        <h3 className={`font-extrabold text-[#06525C] leading-snug mb-2 ${featured ? 'text-lg' : 'text-sm'}`}>
          {post.title}
        </h3>
        <p className="text-xs text-[#2F737D] leading-relaxed mb-4 flex-1 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0,3).map(t => (
            <span key={t} className="px-2 py-0.5 text-[10px] text-[#2F737D] bg-[#F7F9F8] border border-[#D5E1DF] rounded-md">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#EBF0EE]">
          <div className="flex items-center gap-2 text-[11px] text-[#5E8D93]">
            <AuthorAvatar size={22} />
            <span>{post.author}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><CalIcon />{fmtDate(post.date)}</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-[#5E8D93]">
            <ClockIcon />{post.readTime}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Article modal / reader ─────────────────────────────────────────────────── */
function ArticleReader({ post, onClose }) {
  // Convert markdown-like content to basic HTML
  const lines = post.content.split('\n');
  return (
    <div className="fixed inset-0 z-50 bg-[#F7F9F8] overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#D5E1DF]" style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-[#2F737D] hover:text-[#06525C] transition-colors">
            <BackIcon /> Back to Blog
          </button>
          <div className="flex items-center gap-2 text-[11px] text-[#5E8D93]">
            <ClockIcon /> {post.readTime} read
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <CategoryBadge cat={post.category} />
            {post.tags.map(t => (
              <span key={t} className="px-2 py-0.5 text-[10px] text-[#2F737D] bg-[#F7F9F8] border border-[#D5E1DF] rounded-md">{t}</span>
            ))}
          </div>
          <div className="text-5xl mb-5">{post.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#06525C] leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-[#2F737D] leading-relaxed mb-5">{post.excerpt}</p>
          <div className="flex items-center gap-3 pt-4 border-t border-[#D5E1DF]">
            <AuthorAvatar size={40} />
            <div>
              <p className="text-sm font-bold text-[#06525C]">{post.author}</p>
              <p className="text-xs text-[#5E8D93]">Published {fmtDate(post.date)} · {post.readTime} read</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose-internpulse">
          {lines.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-3" />;
            if (line.startsWith('**') && line.endsWith('**')) {
              return <h3 key={i} className="text-base font-extrabold text-[#06525C] mt-6 mb-2">{line.slice(2,-2)}</h3>;
            }
            // Inline bold
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className="text-[#2A6870] text-[15px] leading-[1.85] mb-1">
                {parts.map((p, j) => j % 2 === 0 ? p : <strong key={j} className="font-bold text-[#06525C]">{p}</strong>)}
              </p>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 pt-8 border-t border-[#D5E1DF] text-center">
          <p className="text-sm text-[#2F737D] mb-4">Found this helpful? Explore more resources on InternPulse.</p>
          <button onClick={onClose} className="px-6 py-3 bg-[#06525C] hover:bg-[#043F47] text-white text-sm font-bold rounded-xl transition-colors">
            ← Back to Blog
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main BlogPage ──────────────────────────────────────────────────────────── */
export default function BlogPage() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [openPost, setOpenPost] = useState(null);

  const featured = BLOG_POSTS.filter(p => p.featured);

  const filtered = useMemo(() => {
    let list = [...BLOG_POSTS];
    if (category !== 'All') list = list.filter(p => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, category]);

  if (openPost) return <ArticleReader post={openPost} onClose={() => setOpenPost(null)} />;

  return (
    <div className="min-h-screen bg-[#F7F9F8]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#D5E1DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F0EF] border border-[#B5D2D0] rounded-full mb-4">
              <span className="text-xs font-bold text-[#06525C]">✍️ InternPulse Blog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#06525C] tracking-tight mb-3">
              Placement Insights & Guides
            </h1>
            <p className="text-[#2F737D] text-lg leading-relaxed">
              Real experiences, actionable guides, and honest advice to help Indian students land their first internship.
            </p>
            <div className="flex items-center gap-4 mt-5 text-sm">
              <span className="font-bold text-[#06525C]">{BLOG_POSTS.length} articles</span>
              <span className="text-[#D5E1DF]">·</span>
              <span className="text-[#2F737D]">By Priyanka Agrawal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Search + Filters ─────────────────────────────────────────────── */}
        <div className="bg-white border border-[#D5E1DF] rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3"
          style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon /></div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full border border-[#D5E1DF] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#06525C] placeholder:text-[#5E8D93] outline-none focus:border-[#06525C] focus:ring-2 focus:ring-[#06525C]/10 transition-all" />
          </div>
          <div className="flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${category === cat ? 'bg-[#06525C] text-white border-[#06525C]' : 'bg-white text-[#2F737D] border-[#D5E1DF] hover:border-[#06525C]'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Featured posts (only shown when no search/filter active) ───── */}
        {!search && category === 'All' && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-extrabold text-[#06525C]">⭐ Featured Posts</h2>
              <div className="flex-1 h-px bg-[#D5E1DF]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {featured.map(p => <PostCard key={p.id} post={p} onOpen={setOpenPost} featured />)}
            </div>
          </section>
        )}

        {/* ── Latest / filtered posts ───────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-extrabold text-[#06525C]">
              {search || category !== 'All' ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : '📰 All Articles'}
            </h2>
            <div className="flex-1 h-px bg-[#D5E1DF]" />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-[#D5E1DF] rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-bold text-[#06525C] mb-1">No articles found</h3>
              <p className="text-sm text-[#2F737D]">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => <PostCard key={p.id} post={p} onOpen={setOpenPost} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
