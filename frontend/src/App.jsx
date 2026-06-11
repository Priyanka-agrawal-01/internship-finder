import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar        from './components/Navbar';
import SearchFilter  from './components/SearchFilter';
import JobCard       from './components/JobCard';
import SubscribeForm from './components/SubscribeForm';
import CompaniesPage  from './pages/CompaniesPage';
import ResourcesPage  from './pages/ResourcesPage';
import BlogPage       from './pages/BlogPage';
import AboutPage      from './pages/AboutPage';
import AlertsPage     from './pages/AlertsPage';

const getBackendUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};
const BACKEND_URL = getBackendUrl();

/* ─── Popular companies list (right sidebar) ──────── */
const POPULAR_COMPANIES = [
  { name: 'Google',   color: '#EA4335' },
  { name: 'Microsoft',color: '#00A4EF' },
  { name: 'Amazon',   color: '#FF9900' },
  { name: 'Adobe',    color: '#FF0000' },
  { name: 'Flipkart', color: '#2563EB' },
  { name: 'Razorpay', color: '#2563EB' },
];

/* ─── Trust indicators (footer strip) ────────────── */
const TRUST_ITEMS = [
  { emoji: '🌍', title: 'Worldwide Coverage', desc: 'Internships from any company — India, remote, US, UK and more. No curated list.' },
  { emoji: '⚡', title: 'Real-Time Feed',     desc: 'Jobs fetched every 30 minutes directly from Remotive, Arbeitnow, JSearch, Adzuna and The Muse.' },
  { emoji: '🔍', title: 'True Search Engine', desc: 'Filter by role, company, skills, work mode, country and source — all at once.' },
  { emoji: '📈', title: 'Career Hub',         desc: 'Pair the Jobs feed with the Resources hub — resume templates, DSA roadmaps, and interview guides.' },
];

/* ─── Top-paying companies ──────────────────────────── */
const TOP_COMPANIES = [
  { name:'Google',      stipend:'₹1.5–2L/mo',  color:'#EA4335', icon:'G'  },
  { name:'Microsoft',   stipend:'₹1.2–1.8L/mo', color:'#00A4EF', icon:'M'  },
  { name:'Uber',        stipend:'₹1–1.5L/mo',   color:'#000000', icon:'U'  },
  { name:'LinkedIn',    stipend:'₹1–1.4L/mo',   color:'#0A66C2', icon:'in' },
  { name:'ServiceNow',  stipend:'₹90K–1.2L/mo', color:'#62D84E', icon:'SN' },
  { name:'Atlassian',   stipend:'₹80K–1.1L/mo', color:'#0052CC', icon:'A'  },
  { name:'Adobe',       stipend:'₹75K–1L/mo',   color:'#FF0000', icon:'Ad' },
];

const ECE_COMPANIES_SET = new Set([
  'Qualcomm','Intel','AMD','Cadence','Synopsys','Broadcom',
  'Texas Instruments','Marvell','MediaTek','Nokia','Ericsson',
  'Samsung Semiconductors','Micron Technology','NXP Semiconductors',
  'STMicroelectronics','Infineon Technologies','Renesas','Keysight Technologies',
  'National Instruments','Analog Devices','Lam Research','Applied Materials',
  'ASML','NVIDIA','ARM Holdings','Bosch','Siemens','Honeywell','Rockwell Automation',
  'ABB','Emerson','Schneider Electric','GE Digital','L&T Technology Services',
  'Tata Elxsi','KPIT Technologies','Continental','Harman','Visteon','Aptiv',
  'Mphasis','Zensar Technologies','Cyient','LTTS', 'Texas Instruments'
]);

/* ─── StatsSection ──────────────────────────────────── */
function StatsSection({ jobsCount, companiesCount, countriesCount }) {
  return (
    <div className="bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: jobsCount    || '—',  label: 'Live Internships',   emoji: '💼', color:'#2563EB' },
            { value: companiesCount || '—', label: 'Companies Hiring',  emoji: '🏢', color:'#22C55E' },
            { value: countriesCount || '—', label: 'Countries',         emoji: '🌍', color:'#EA580C' },
            { value: '5',                   label: 'API Sources',        emoji: '⚡', color:'#7C3AED' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-[#FAFBFD]">
              <div className="text-2xl shrink-0">{s.emoji}</div>
              <div>
                <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TopPayingCompanies ────────────────────────────── */
function TopPayingCompanies({ onNavigate }) {
  return (
    <div className="bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A]">Top Paying Internship Companies</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Estimated stipend ranges for India-based roles</p>
          </div>
          <button onClick={() => onNavigate('companies')}
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            View all →
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOP_COMPANIES.map(c => (
            <div key={c.name} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#FAFBFD] border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] hover:shadow-sm transition-all cursor-pointer">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shrink-0"
                style={{ background: c.color }}>
                {c.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">{c.name}</div>
                <div className="text-[10px] text-[#22C55E] font-semibold">{c.stipend}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton card ───────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] p-5 space-y-3 animate-pulse" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#F1F5F9]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-[#F1F5F9] rounded-md w-3/4" />
          <div className="h-3 bg-[#F1F5F9] rounded-md w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-3 bg-[#F1F5F9] rounded-md w-24" />
        <div className="h-3 bg-[#F1F5F9] rounded-md w-20" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-[#F1F5F9] rounded-full w-16" />
        <div className="h-5 bg-[#F1F5F9] rounded-full w-14" />
        <div className="h-5 bg-[#F1F5F9] rounded-full w-12" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 bg-[#F1F5F9] rounded-md w-14" />
        <div className="h-5 bg-[#F1F5F9] rounded-md w-16" />
        <div className="h-5 bg-[#F1F5F9] rounded-md w-12" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-8 bg-[#F1F5F9] rounded-xl w-16" />
        <div className="h-8 bg-[#F1F5F9] rounded-xl flex-1" />
      </div>
    </div>
  );
}

/* ─── Company avatar (right sidebar) ─────────────── */
function CompanyPill({ name, color }) {
  return (
    <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: color }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <span className="text-sm text-[#0F172A] font-medium group-hover:text-[#2563EB] transition-colors">{name}</span>
    </div>
  );
}

/* ─── Hero illustration (inline SVG) ─────────────── */
function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Decorative blobs */}
      <div className="absolute w-56 h-56 rounded-full bg-[#EFF6FF] -top-6 -right-6 -z-10" />
      <div className="absolute w-32 h-32 rounded-full bg-[#F0FDF4] bottom-0 left-4 -z-10" />

      {/* SVG illustration */}
      <svg viewBox="0 0 380 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
        {/* Desk */}
        <rect x="60" y="220" width="260" height="14" rx="7" fill="#E2E8F0"/>
        {/* Laptop base */}
        <rect x="100" y="195" width="180" height="30" rx="8" fill="#CBD5E1"/>
        {/* Laptop screen */}
        <rect x="110" y="100" width="160" height="100" rx="10" fill="#1E293B"/>
        <rect x="116" y="106" width="148" height="88" rx="7" fill="#0F172A"/>
        {/* Screen content */}
        <rect x="124" y="114" width="90" height="6" rx="3" fill="#2563EB" opacity="0.8"/>
        <rect x="124" y="124" width="70" height="4" rx="2" fill="#64748B" opacity="0.6"/>
        <rect x="124" y="132" width="80" height="4" rx="2" fill="#64748B" opacity="0.4"/>
        <rect x="124" y="142" width="60" height="4" rx="2" fill="#64748B" opacity="0.4"/>
        {/* Green accent on screen */}
        <rect x="200" y="114" width="56" height="30" rx="6" fill="#22C55E" opacity="0.15"/>
        <rect x="208" y="120" width="40" height="5" rx="2.5" fill="#22C55E" opacity="0.7"/>
        <rect x="208" y="129" width="30" height="4" rx="2" fill="#22C55E" opacity="0.5"/>
        {/* Hinge */}
        <rect x="100" y="193" width="180" height="6" rx="3" fill="#94A3B8"/>
        {/* Person – body */}
        <ellipse cx="190" cy="260" rx="30" ry="14" fill="#DBEAFE"/>
        <rect x="168" y="225" width="44" height="40" rx="16" fill="#BFDBFE"/>
        {/* Person – head */}
        <circle cx="190" cy="210" r="22" fill="#FDE68A"/>
        {/* Hair */}
        <path d="M168 205 Q190 185 212 205" fill="#92400E"/>
        {/* Eyes */}
        <circle cx="183" cy="210" r="2" fill="#1E293B"/>
        <circle cx="197" cy="210" r="2" fill="#1E293B"/>
        {/* Smile */}
        <path d="M185 217 Q190 222 195 217" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* Arms */}
        <path d="M168 240 Q145 250 148 260" stroke="#BFDBFE" strokeWidth="12" strokeLinecap="round"/>
        <path d="M212 240 Q235 250 232 260" stroke="#BFDBFE" strokeWidth="12" strokeLinecap="round"/>
        {/* Floating badge 1 */}
        <rect x="28" y="120" width="72" height="30" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
        <circle cx="42" cy="135" r="7" fill="#22C55E" opacity="0.2"/>
        <circle cx="42" cy="135" r="4" fill="#22C55E"/>
        <rect x="54" y="130" width="36" height="4" rx="2" fill="#0F172A" opacity="0.7"/>
        <rect x="54" y="138" width="24" height="3" rx="1.5" fill="#64748B" opacity="0.5"/>
        {/* Floating badge 2 */}
        <rect x="280" y="148" width="76" height="30" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
        <rect x="292" y="157" width="52" height="4" rx="2" fill="#2563EB" opacity="0.8"/>
        <rect x="292" y="165" width="36" height="3" rx="1.5" fill="#64748B" opacity="0.5"/>
        {/* Stars */}
        <text x="308" y="95" fontSize="18" opacity="0.25">✦</text>
        <text x="62" y="88" fontSize="12" opacity="0.2">✦</text>
        <text x="290" y="200" fontSize="10" opacity="0.2">✦</text>
      </svg>
    </div>
  );
}

/* ─── Sort bar ─────────────────────────────────────── */
const SORT_OPTIONS = [
  { value:'newest',  label:'🕒 Newest first'    },
  { value:'stipend', label:'💰 Highest stipend'  },
  { value:'updated', label:'🔄 Recently updated' },
  { value:'remote',  label:'🌐 Remote first'     },
];
function SortBar({ count, sort, setSort }) {
  return (
    <div className="flex items-center justify-between mb-4 bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5" style={{ boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
      <p className="text-sm text-[#64748B]">
        <span className="font-bold text-[#0F172A]">{count}</span> {count === 1 ? 'internship' : 'internships'} found
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#94A3B8] hidden sm:block">Sort:</span>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setSort(o.value)}
              className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                sort === o.value
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── App ─────────────────────────────────────────── */
export default function App() {
  const [jobs,         setJobs]         = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [sort,         setSort]         = useState('newest');
  const [cacheStatus,  setCacheStatus]  = useState(null);
  const [lastRefresh,  setLastRefresh]  = useState(null);

  // ── Multi-dimension filters ──────────────────────
  const [searchTerm,       setSearchTerm]       = useState('');  // role/title
  const [companySearch,    setCompanySearch]    = useState('');  // company text search
  const [skillsSearch,     setSkillsSearch]     = useState('');  // skills/tech
  const [selectedSource,   setSelectedSource]   = useState('');  // API source
  const [selectedCountry,  setSelectedCountry]  = useState('');  // country
  const [selectedWorkMode, setSelectedWorkMode] = useState('');  // Remote/Hybrid/On-site
  const [jobType,          setJobType]          = useState('all'); // all|internship
  const [countriesList,    setCountriesList]    = useState([]);

  const [currentPage, setCurrentPage] = useState('home');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false);

  useEffect(() => {
    if (currentPage === 'jobs') {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [currentPage]);

  const subscribeRef = useRef(null);
  const jobsRef      = useRef(null);

  /* fetch */
  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/jobs`);
      if (res.data?.success) {
        const list = res.data.jobs || [];
        setJobs(list);
        setFilteredJobs(list);
        setCacheStatus(res.data.cacheStatus ?? null);
        setLastRefresh(new Date().toISOString());

        // Build countries list from live jobs, ensuring India and Remote are always options
        const countries = [...new Set(['India', 'Remote', ...list.map(j => j.country).filter(Boolean)])].sort();
        setCountriesList(countries);
      } else throw new Error('Unsuccessful response');
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Could not connect to the server. Make sure the backend is running.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => { fetchJobs(); }, []);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const id = setInterval(() => { fetchJobs(true); }, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Multi-dimension filter + sort ─────────────── */
  useEffect(() => {
    let result = [...jobs];

    // 1. Role / title search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q)
      );
    }

    // 2. Company text search
    if (companySearch.trim()) {
      const q = companySearch.toLowerCase();
      result = result.filter(j => j.company?.toLowerCase().includes(q));
    }

    // 3. Skills search
    if (skillsSearch.trim()) {
      const q = skillsSearch.toLowerCase();
      result = result.filter(j =>
        (j.skills || j.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // 4. Source filter
    if (selectedSource) result = result.filter(j => j.source === selectedSource);

    // 5. Country filter
    if (selectedCountry) result = result.filter(j => j.country === selectedCountry);

    // 6. Work mode filter
    if (selectedWorkMode) result = result.filter(j => j.workMode === selectedWorkMode);

    // 7. Internship type
    if (jobType === 'internship') result = result.filter(j => j.isInternship);

    // ── Sort ───────────────────────────────────────
    const parseStipendVal = (s) => {
      if (!s) return -1;
      const m = s.match(/(\d[\d,]*)/);  // extract first number
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : -1;
    };

    result.sort((a, b) => {
      if (sort === 'newest')  return new Date(b.postedAt)  - new Date(a.postedAt);
      if (sort === 'oldest')  return new Date(a.postedAt)  - new Date(b.postedAt);
      if (sort === 'stipend') {
        const diff = parseStipendVal(b.stipend) - parseStipendVal(a.stipend);
        return diff !== 0 ? diff : new Date(b.postedAt) - new Date(a.postedAt);
      }
      if (sort === 'remote') {
        if (a.isRemote !== b.isRemote) return a.isRemote ? -1 : 1;
        return new Date(b.postedAt) - new Date(a.postedAt);
      }
      if (sort === 'updated') return new Date(b.fetchedAt) - new Date(a.fetchedAt);
      return new Date(b.postedAt) - new Date(a.postedAt);
    });

    setFilteredJobs(result);
  }, [searchTerm, companySearch, skillsSearch, selectedSource, selectedCountry, selectedWorkMode, jobType, jobs, sort]);

  const activeFilterCount = [
    searchTerm, companySearch, skillsSearch, selectedSource, selectedCountry, selectedWorkMode,
  ].filter(Boolean).length + (jobType !== 'all' ? 1 : 0);

  const handleReset = () => {
    setSearchTerm(''); setCompanySearch(''); setSkillsSearch('');
    setSelectedSource(''); setSelectedCountry(''); setSelectedWorkMode('');
    setJobType('all');
  };

  const scrollToJobs = () => jobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ─── Render ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* NAVBAR */}
      <Navbar
        jobsCount={jobs.length}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSubscribeClick={() => setCurrentPage('alerts')}
      />

      {/* ── PAGE ROUTING ─── */}
      {currentPage === 'companies' && <CompaniesPage />}
      {currentPage === 'resources' && <ResourcesPage />}
      {currentPage === 'blog'      && <BlogPage />}
      {currentPage === 'about'     && <AboutPage />}
      {currentPage === 'alerts'    && <AlertsPage />}

      {/* ── HOME CONTENT ───────────────────────────────── */}
      {currentPage === 'home' && (
      <>
      <StatsSection
        jobsCount={jobs.length}
        companiesCount={[...new Set(jobs.map(j => j.company))].length || undefined}
        countriesCount={countriesList.length || undefined}
      />
      <TopPayingCompanies onNavigate={setCurrentPage} />
      
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] badge-new inline-block"/>
                <span className="text-xs font-semibold text-[#2563EB]">{jobs.length} live internships — Worldwide & India</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight mb-5">
                Find internships that shape{' '}
                <span className="text-[#2563EB]">your future</span>
              </h1>

              <p className="text-[#64748B] text-lg leading-relaxed mb-8 max-w-lg">
                 Real-time internships from any company, anywhere — aggregated from Remotive, Arbeitnow, JSearch, The Muse and more. Apply directly in one click.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentPage('jobs')}
                  className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl transition-colors"
                >
                  Browse Internships
                </button>
                <button
                  onClick={() => setCurrentPage('alerts')}
                  className="px-6 py-3 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold border border-[#E2E8F0] rounded-xl transition-colors"
                >
                  Get Alerts
                </button>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-[#E2E8F0]">
                {[
                  { value: jobs.length || '30+', label: 'Live Internships' },
                  { value: [...new Set(jobs.map(j=>j.company))].length || '30+', label: 'Companies' },
                  { value: '5',   label: 'API Sources' },
                  { value: '100%', label: 'Free Forever' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-[#0F172A]">{s.value}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – illustration */}
            <div className="hidden md:block relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────── */}
      <section className="bg-white border-t border-[#E2E8F0] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-10">
            Why students trust InternPulse
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="text-center px-4">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">{item.title}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-[#0F172A]">InternPulse</span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            © {new Date().getFullYear()} InternPulse · Built for Indian students · Powered by verified job APIs
          </p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="text-xs text-[#64748B] hover:text-[#0F172A] transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
      </>
      )}

      {/* ── JOBS INTERACTIVE 3-COLUMN DASHBOARD ────────────────── */}
      {currentPage === 'jobs' && (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#F8FAFC]">
          
          {/* Mobile Sticky Action Bar */}
          <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between gap-2 lg:hidden shrink-0">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 py-2 px-3 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#334155] bg-white hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>🔍</span> Filters {activeFilterCount > 0 && <span className="ml-1 bg-[#2563EB] text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{activeFilterCount}</span>}
            </button>
            <button
              onClick={() => setMobileCompanyOpen(true)}
              className="flex-1 py-2 px-3 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#334155] bg-white hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>🏢</span> Companies
            </button>
            <button
              onClick={() => setCurrentPage('alerts')}
              className="flex-1 py-2 px-3 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#334155] bg-white hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>🔔</span> Alerts
            </button>
          </div>

          {/* Grid Layout Container */}
          <div className="flex flex-1 overflow-hidden h-full">
            
            {/* 1. LEFT SIDEBAR: Filters (Fixed width, independent scroll) */}
            <aside className="w-[280px] shrink-0 border-r border-[#E2E8F0] bg-white overflow-y-auto scrollbar-thin p-4 hidden lg:block h-full">
              <SearchFilter
                searchTerm={searchTerm}           setSearchTerm={setSearchTerm}
                companySearch={companySearch}     setCompanySearch={setCompanySearch}
                skillsSearch={skillsSearch}       setSkillsSearch={setSkillsSearch}
                selectedSource={selectedSource}   setSelectedSource={setSelectedSource}
                selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                selectedWorkMode={selectedWorkMode} setSelectedWorkMode={setSelectedWorkMode}
                jobType={jobType}                 setJobType={setJobType}
                countries={countriesList}
                onReset={handleReset}
                activeFilterCount={activeFilterCount}
              />
            </aside>

            {/* 2. CENTER PANEL: Internship feed (Independent scroll) */}
            <section className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-thin p-4 bg-[#F8FAFC]">
              
              {/* Feed discovery header */}
              {!loading && !error && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-sm font-bold text-[#0F172A]">🔍 Internship Discovery Feed</h2>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Aggregated from <span className="font-semibold text-[#0F172A]">Remotive · Arbeitnow · JSearch · The Muse · Adzuna</span>
                        {cacheStatus && <> · <span className="text-[#22C55E] font-semibold">{cacheStatus.jobCount} cached</span></>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastRefresh && (
                        <span className="text-[10px] text-[#94A3B8] hidden sm:inline">
                          Updated: {new Date(lastRefresh).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                        </span>
                      )}
                      <button
                        onClick={() => fetchJobs(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg transition-colors"
                      >
                        Refresh
                      </button>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={handleReset}
                          className="px-3 py-1.5 text-[11px] font-bold text-[#EA580C] bg-[#FFF7ED] border border-[#FED7AA] rounded-lg transition-colors"
                        >
                          Clear ({activeFilterCount})
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Source badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#F1F5F9]">
                    {[
                      { name:'Remotive',    bg:'#FDF4FF', text:'#9333EA', border:'#E9D5FF' },
                      { name:'Arbeitnow',   bg:'#F0FDF4', text:'#16A34A', border:'#BBF7D0' },
                      { name:'The Muse',    bg:'#FFF1F2', text:'#E11D48', border:'#FECDD3' },
                      { name:'Adzuna',      bg:'#FFF7ED', text:'#EA580C', border:'#FED7AA' },
                      { name:'JSearch',     bg:'#ECFDF5', text:'#059669', border:'#A7F3D0' },
                    ].map(s => (
                      <button
                        key={s.name}
                        onClick={() => setSelectedSource(s.name === selectedSource ? '' : s.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all"
                        style={{
                          background: s.name === selectedSource ? s.text : s.bg,
                          color: s.name === selectedSource ? 'white' : s.text,
                          borderColor: s.border,
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort controls and job count */}
              {!loading && !error && filteredJobs.length > 0 && (
                <SortBar count={filteredJobs.length} sort={sort} setSort={setSort} />
              )}

              {/* Skeletons loader */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Errors container */}
              {!loading && error && (
                <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
                  <h3 className="font-bold text-[#0F172A] mb-1 text-sm">Connection Error</h3>
                  <p className="text-xs text-[#64748B] mb-4">{error}</p>
                  <button onClick={fetchJobs} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors">
                    Retry
                  </button>
                </div>
              )}

              {/* No results card */}
              {!loading && !error && filteredJobs.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center shadow-sm">
                  <h3 className="font-bold text-[#0F172A] mb-1 text-sm">No results found</h3>
                  <p className="text-xs text-[#64748B] mb-4">Try adjusting your filters or search terms.</p>
                  <button onClick={handleReset} className="px-4 py-2 border border-[#E2E8F0] text-[#2563EB] text-xs font-semibold rounded-xl hover:border-[#2563EB] transition-colors">
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              {!loading && !error && filteredJobs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </section>

            {/* 3. RIGHT SIDEBAR: Companies & Insights (Fixed width, independent scroll) */}
            <aside className="w-[300px] shrink-0 border-l border-[#E2E8F0] bg-white overflow-y-auto scrollbar-thin p-4 hidden xl:block h-full space-y-5">
              
              {/* Popular Companies */}
              <div className="border border-[#E2E8F0] rounded-xl p-4 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">Popular Companies</h3>
                <div className="divide-y divide-[#F1F5F9] -mx-1">
                  {POPULAR_COMPANIES.map((c) => (
                    <CompanyPill key={c.name} name={c.name} color={c.color} />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage('companies')}
                  className="mt-3.5 w-full text-left text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                >
                  View company prep guide →
                </button>
              </div>

              {/* Quick Stats */}
              <div className="border border-[#E2E8F0] rounded-xl p-4 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">Quick Stats</h3>
                <div className="space-y-2 text-xs text-[#475569]">
                  <div className="flex justify-between">
                    <span>Active Internships:</span>
                    <span className="font-bold text-[#2563EB]">{jobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IT Opportunities:</span>
                    <span className="font-bold text-[#22C55E]">{jobs.filter(j => !ECE_COMPANIES_SET.has(j.company)).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ECE Opportunities:</span>
                    <span className="font-bold text-[#EA580C]">{jobs.filter(j => ECE_COMPANIES_SET.has(j.company)).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remote Openings:</span>
                    <span className="font-bold text-[#7C3AED]">{jobs.filter(j => j.workMode === 'Remote' || j.isRemote).length}</span>
                  </div>
                </div>
              </div>

              {/* Featured Companies Showcase */}
              <div className="border border-[#E2E8F0] rounded-xl p-4 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">Featured Companies</h3>
                <div className="flex flex-col gap-2.5">
                  {TOP_COMPANIES.map(c => (
                    <div key={c.name} className="flex items-center gap-2.5 p-2 bg-[#FAFBFD] border border-[#E2E8F0] rounded-lg">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: c.color }}>
                        {c.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#0F172A] truncate">{c.name}</div>
                        <div className="text-[10px] text-[#22C55E] font-semibold">{c.stipend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Placement Tips */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
                <p className="text-xs font-bold text-[#2563EB] mb-1">💡 Placement Tip</p>
                <p className="text-xs text-[#1E40AF] leading-relaxed">
                  Always optimize your resume using the X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]" to pass ATS reviews.
                </p>
              </div>

            </aside>
          </div>

          {/* MOBILE SLIDE-OUT DRAWERS */}
          {/* 1. Left drawer: Filters */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
              <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl overflow-y-auto p-5 animate-slide-in-left">
                <div className="flex items-center justify-between mb-4 border-b border-[#F1F5F9] pb-3 shrink-0">
                  <h3 className="font-bold text-sm text-[#0F172A]">Filter Openings</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-xs font-bold text-[#64748B]">✕ Close</button>
                </div>
                <div className="flex-1">
                  <SearchFilter
                    searchTerm={searchTerm}           setSearchTerm={setSearchTerm}
                    companySearch={companySearch}     setCompanySearch={setCompanySearch}
                    skillsSearch={skillsSearch}       setSkillsSearch={setSkillsSearch}
                    selectedSource={selectedSource}   setSelectedSource={setSelectedSource}
                    selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
                    selectedWorkMode={selectedWorkMode} setSelectedWorkMode={setSelectedWorkMode}
                    jobType={jobType}                 setJobType={setJobType}
                    countries={countriesList}
                    onReset={handleReset}
                    activeFilterCount={activeFilterCount}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Right drawer: Companies */}
          {mobileCompanyOpen && (
            <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
              <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setMobileCompanyOpen(false)} />
              <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl overflow-y-auto p-5 animate-slide-in-right">
                <div className="flex items-center justify-between mb-4 border-b border-[#F1F5F9] pb-3 shrink-0">
                  <h3 className="font-bold text-sm text-[#0F172A]">Companies & Insights</h3>
                  <button onClick={() => setMobileCompanyOpen(false)} className="p-1 text-xs font-bold text-[#64748B]">✕ Close</button>
                </div>
                <div className="space-y-5 flex-1">
                  {/* Popular Companies */}
                  <div className="border border-[#E2E8F0] rounded-xl p-4 shadow-sm bg-white">
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">Popular Companies</h3>
                    <div className="divide-y divide-[#F1F5F9] -mx-1">
                      {POPULAR_COMPANIES.map((c) => (
                        <CompanyPill key={c.name} name={c.name} color={c.color} onClick={() => setMobileCompanyOpen(false)} />
                      ))}
                    </div>
                  </div>
                  {/* Quick Stats */}
                  <div className="border border-[#E2E8F0] rounded-xl p-4 shadow-sm bg-white">
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">Quick Stats</h3>
                    <div className="space-y-2 text-xs text-[#475569]">
                      <div className="flex justify-between">
                        <span>Active Jobs:</span>
                        <span className="font-bold text-[#2563EB]">{jobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remote Roles:</span>
                        <span className="font-bold text-[#7C3AED]">{jobs.filter(j => j.workMode === 'Remote' || j.isRemote).length}</span>
                      </div>
                    </div>
                  </div>
                  {/* Placement Tip */}
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#2563EB] mb-1">💡 Placement Tip</p>
                    <p className="text-xs text-[#1E40AF] leading-relaxed">
                      Optimize resume sections for ATS systems using standard terminology and active verbs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
