import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import axios from 'axios';
import Navbar        from './components/Navbar';
import SearchFilter  from './components/SearchFilter';
import JobCard       from './components/JobCard';
import CompaniesPage  from './pages/CompaniesPage';
import ResourcesPage  from './pages/ResourcesPage';
import BlogPage       from './pages/BlogPage';
import AboutPage      from './pages/AboutPage';
import AlertsPage     from './pages/AlertsPage';
import MyJobsPage     from './pages/MyJobsPage';
import { BACKEND_URL } from './lib/api';
import { useAuth } from './auth/authContext';

// only the site admin opens it, so it loads on its own instead of in every visitor's bundle
const AdminPage = lazy(() => import('./pages/AdminPage'));


/* ─── Popular companies list (right sidebar) ──────── */
const POPULAR_COMPANIES = [
  { name: 'Google',   color: '#EA4335' },
  { name: 'Microsoft',color: '#00A4EF' },
  { name: 'Amazon',   color: '#FF9900' },
  { name: 'Adobe',    color: '#FF0000' },
  { name: 'Flipkart', color: '#06525C' },
  { name: 'Razorpay', color: '#06525C' },
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

/* ─── Skeleton card ───────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-card border border-[#D5E1DF] p-5 space-y-3 animate-pulse" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#EBF0EE]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-[#EBF0EE] rounded-md w-3/4" />
          <div className="h-3 bg-[#EBF0EE] rounded-md w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-3 bg-[#EBF0EE] rounded-md w-24" />
        <div className="h-3 bg-[#EBF0EE] rounded-md w-20" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-[#EBF0EE] rounded-full w-16" />
        <div className="h-5 bg-[#EBF0EE] rounded-full w-14" />
        <div className="h-5 bg-[#EBF0EE] rounded-full w-12" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 bg-[#EBF0EE] rounded-md w-14" />
        <div className="h-5 bg-[#EBF0EE] rounded-md w-16" />
        <div className="h-5 bg-[#EBF0EE] rounded-md w-12" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-8 bg-[#EBF0EE] rounded-xl w-16" />
        <div className="h-8 bg-[#EBF0EE] rounded-xl flex-1" />
      </div>
    </div>
  );
}

/* ─── Company avatar (right sidebar) ─────────────── */
function CompanyPill({ name, color, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-[#F7F9F8] transition-colors cursor-pointer group">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: color }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <span className="text-sm text-[#06525C] font-medium group-hover:text-[#06525C] transition-colors">{name}</span>
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
function SortBar({ count, sort, setSort, internshipsOnly }) {
  const noun = internshipsOnly ? 'internship' : 'opening';
  return (
    <div className="flex items-center justify-between mb-4 bg-white border border-[#D5E1DF] rounded-xl px-4 py-2.5" style={{ boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
      <p className="text-sm text-[#2F737D]">
        <span className="font-bold text-[#06525C]">{count}</span> {count === 1 ? noun : `${noun}s`} found
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#5E8D93] hidden sm:block">Sort:</span>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setSort(o.value)}
              className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                sort === o.value
                  ? 'bg-[#06525C] text-white border-[#06525C]'
                  : 'bg-white text-[#2F737D] border-[#D5E1DF] hover:border-[#06525C] hover:text-[#06525C]'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Admin: only for the admin account (the API checks this too) ─── */
function AdminGate({ onNavigate }) {
  const { status, user, openAuth } = useAuth();
  if (status === 'loading') return <div className="max-w-7xl mx-auto px-6 py-16 text-sm text-[#2F737D]">Checking your sign-in…</div>;
  if (user?.role === 'admin') {
    return (
      <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-16 text-sm text-[#2F737D]">Loading the admin panel…</div>}>
        <AdminPage onNavigate={onNavigate} />
      </Suspense>
    );
  }
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-[#06525C]">Admin</h1>
      <p className="text-sm text-[#2F737D] mt-2">
        {status === 'signedIn' ? 'This page is only for the site admin.' : 'Sign in with the admin account to open this page.'}
      </p>
      <div className="flex justify-center gap-2 mt-5">
        {status !== 'signedIn' && <button onClick={() => openAuth('signin')} className="px-4 py-2 rounded-xl bg-[#06525C] text-white text-sm font-semibold">Sign in</button>}
        <button onClick={() => onNavigate('jobs')} className="px-4 py-2 rounded-xl border border-[#C3D4D2] text-[#06525C] text-sm font-semibold">Go to the job feed</button>
      </div>
    </div>
  );
}

/* ─── App ─────────────────────────────────────────── */
/* ─── Routing ─────────────────────────────────────── */
const PAGES = ['jobs', 'companies', 'resources', 'blog', 'about', 'alerts', 'myjobs', 'admin'];
const pageFromHash = () => {
  const h = (typeof window !== 'undefined' ? window.location.hash : '').replace('#', '');
  return PAGES.includes(h) ? h : 'jobs';
};

/* ─── Data helpers ────────────────────────────────── */
const parseStipendVal = (s) => {
  if (!s) return -1;
  const m = s.match(/(\d[\d,]*)/);  // extract first number
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : -1;
};

const errorMessage = (err) =>
  err?.response?.data?.message || 'Could not connect to the server. Make sure the backend is running.';

// Pure request — no React state involved
const requestJobs = async () => {
  const res = await axios.get(`${BACKEND_URL}/api/jobs`);
  if (!res.data?.success) throw new Error('Unsuccessful response');
  return res.data;
};

export default function App() {
  const [jobs,         setJobs]         = useState([]);
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

  const [currentPage, setCurrentPage] = useState(pageFromHash);

  // "Home" is the landing page; every other page is a hash on app.html
  const navigate = useCallback((page) => {
    if (page === 'home') { window.location.href = '/'; return; }
    setCurrentPage(page);
    if (window.location.hash !== '#' + page) window.history.pushState(null, '', '#' + page);
  }, []);

  useEffect(() => {
    const onHash = () => setCurrentPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('popstate', onHash); };
  }, []);
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

  /* fetch */
  const applyJobs = useCallback((data) => {
    setJobs(data.jobs || []);
    setCacheStatus(data.cacheStatus ?? null);
    setLastRefresh(new Date().toISOString());
  }, []);

  // Manual refresh / retry: shows the loading state and surfaces errors
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      applyJobs(await requestJobs());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch (state is only set once the request settles)
  useEffect(() => {
    let ignore = false;
    requestJobs()
      .then(data => { if (!ignore) applyJobs(data); })
      .catch(err => { if (!ignore) setError(errorMessage(err)); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [applyJobs]);

  // Silent auto-refresh every 30 minutes (keeps showing current data if it fails)
  useEffect(() => {
    const id = setInterval(() => { requestJobs().then(applyJobs).catch(() => {}); }, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [applyJobs]);

  // Countries present in live jobs, always offering India and Remote
  const countriesList = useMemo(
    () => [...new Set(['India', 'Remote', ...jobs.map(j => j.country).filter(Boolean)])].sort(),
    [jobs]
  );

  const internshipCount = useMemo(() => jobs.filter(j => j.isInternship).length, [jobs]);

  /* ── Multi-dimension filter + sort ─────────────── */
  const filteredJobs = useMemo(() => {
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

    return result;
  }, [searchTerm, companySearch, skillsSearch, selectedSource, selectedCountry, selectedWorkMode, jobType, jobs, sort]);

  const activeFilterCount = [
    searchTerm, companySearch, skillsSearch, selectedSource, selectedCountry, selectedWorkMode,
  ].filter(Boolean).length + (jobType !== 'all' ? 1 : 0);

  const handleReset = () => {
    setSearchTerm(''); setCompanySearch(''); setSkillsSearch('');
    setSelectedSource(''); setSelectedCountry(''); setSelectedWorkMode('');
    setJobType('all');
  };

  /* ─── Render ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F7F9F8]">

      {/* NAVBAR */}
      <Navbar
        jobsCount={jobs.length}
        currentPage={currentPage}
        onNavigate={navigate}
        onSubscribeClick={() => navigate('alerts')}
      />

      {/* ── PAGE ROUTING ─── */}
      {currentPage === 'companies' && <CompaniesPage />}
      {currentPage === 'resources' && <ResourcesPage />}
      {currentPage === 'blog'      && <BlogPage />}
      {currentPage === 'about'     && <AboutPage />}
      {currentPage === 'alerts'    && <AlertsPage />}
      {currentPage === 'myjobs'    && <MyJobsPage onNavigate={navigate} />}
      {currentPage === 'admin'     && <AdminGate onNavigate={navigate} />}

      {/* ── JOBS INTERACTIVE 3-COLUMN DASHBOARD ────────────────── */}
      {currentPage === 'jobs' && (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#F7F9F8]">
          
          {/* Mobile Sticky Action Bar */}
          <div className="sticky top-0 z-40 bg-white border-b border-[#D5E1DF] px-4 py-2.5 flex items-center justify-between gap-2 lg:hidden shrink-0">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 py-2 px-3 border border-[#D5E1DF] rounded-xl text-xs font-bold text-[#1F5F68] bg-white hover:bg-[#F7F9F8] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>🔍</span> Filters {activeFilterCount > 0 && <span className="ml-1 bg-[#06525C] text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{activeFilterCount}</span>}
            </button>
            <button
              onClick={() => setMobileCompanyOpen(true)}
              className="flex-1 py-2 px-3 border border-[#D5E1DF] rounded-xl text-xs font-bold text-[#1F5F68] bg-white hover:bg-[#F7F9F8] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>🏢</span> Companies
            </button>
            <button
              onClick={() => navigate('alerts')}
              className="flex-1 py-2 px-3 border border-[#D5E1DF] rounded-xl text-xs font-bold text-[#1F5F68] bg-white hover:bg-[#F7F9F8] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>🔔</span> Alerts
            </button>
          </div>

          {/* Grid Layout Container */}
          <div className="flex flex-1 overflow-hidden h-full">
            
            {/* 1. LEFT SIDEBAR: Filters (Fixed width, independent scroll) */}
            <aside className="w-[280px] shrink-0 border-r border-[#D5E1DF] bg-white overflow-y-auto scrollbar-thin p-4 hidden lg:block h-full">
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
            <section className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-thin p-4 bg-[#F7F9F8]">
              
              {/* Feed discovery header */}
              {!loading && !error && (
                <div className="bg-white rounded-2xl border border-[#D5E1DF] p-5 mb-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-sm font-bold text-[#06525C]">🔍 Internship Discovery Feed</h2>
                      <p className="text-[11px] text-[#2F737D] mt-0.5">
                        Aggregated from <span className="font-semibold text-[#06525C]">Remotive · Arbeitnow · JSearch · The Muse · Adzuna</span>
                        {cacheStatus && <> · <span className="text-[#22C55E] font-semibold">{cacheStatus.jobCount} cached</span></>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastRefresh && (
                        <span className="text-[10px] text-[#5E8D93] hidden sm:inline">
                          Updated: {new Date(lastRefresh).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                        </span>
                      )}
                      <button
                        onClick={() => fetchJobs()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#06525C] bg-[#E6F0EF] hover:bg-[#D3E5E3] border border-[#B5D2D0] rounded-lg transition-colors"
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
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#EBF0EE]">
                    {[
                      { name:'Remotive',    bg:'#FEFCE8', text:'#A16207', border:'#FDE68A' },
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
                <SortBar count={filteredJobs.length} sort={sort} setSort={setSort} internshipsOnly={jobType === 'internship'} />
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
                  <h3 className="font-bold text-[#06525C] mb-1 text-sm">Connection Error</h3>
                  <p className="text-xs text-[#2F737D] mb-4">{error}</p>
                  <button onClick={() => fetchJobs()} className="px-4 py-2 bg-[#06525C] text-white text-xs font-semibold rounded-xl hover:bg-[#043F47] transition-colors">
                    Retry
                  </button>
                </div>
              )}

              {/* No results card */}
              {!loading && !error && filteredJobs.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#D5E1DF] p-10 text-center shadow-sm">
                  <h3 className="font-bold text-[#06525C] mb-1 text-sm">No results found</h3>
                  <p className="text-xs text-[#2F737D] mb-4">Try adjusting your filters or search terms.</p>
                  <button onClick={handleReset} className="px-4 py-2 border border-[#D5E1DF] text-[#06525C] text-xs font-semibold rounded-xl hover:border-[#06525C] transition-colors">
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
            <aside className="w-[300px] shrink-0 border-l border-[#D5E1DF] bg-white overflow-y-auto scrollbar-thin p-4 hidden xl:block h-full space-y-5">
              
              {/* Popular Companies */}
              <div className="border border-[#D5E1DF] rounded-xl p-4 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-[#06525C] uppercase tracking-wider mb-3">Popular Companies</h3>
                <div className="divide-y divide-[#EBF0EE] -mx-1">
                  {POPULAR_COMPANIES.map((c) => (
                    <CompanyPill key={c.name} name={c.name} color={c.color} />
                  ))}
                </div>
                <button
                  onClick={() => navigate('companies')}
                  className="mt-3.5 w-full text-left text-[11px] font-bold text-[#06525C] hover:text-[#043F47] transition-colors"
                >
                  View company prep guide →
                </button>
              </div>

              {/* Quick Stats */}
              <div className="border border-[#D5E1DF] rounded-xl p-4 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-[#06525C] uppercase tracking-wider mb-2.5">Quick Stats</h3>
                <div className="space-y-2 text-xs text-[#2A6870]">
                  <div className="flex justify-between">
                    <span>Active Internships:</span>
                    <span className="font-bold text-[#06525C]">{internshipCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>All Openings:</span>
                    <span className="font-bold text-[#06525C]">{jobs.length}</span>
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
                    <span className="font-bold text-[#A16207]">{jobs.filter(j => j.workMode === 'Remote' || j.isRemote).length}</span>
                  </div>
                </div>
              </div>

              {/* Featured Companies Showcase */}
              <div className="border border-[#D5E1DF] rounded-xl p-4 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-[#06525C] uppercase tracking-wider mb-3">Featured Companies</h3>
                <div className="flex flex-col gap-2.5">
                  {TOP_COMPANIES.map(c => (
                    <div key={c.name} className="flex items-center gap-2.5 p-2 bg-[#F2F6F5] border border-[#D5E1DF] rounded-lg">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: c.color }}>
                        {c.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#06525C] truncate">{c.name}</div>
                        <div className="text-[10px] text-[#22C55E] font-semibold">{c.stipend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Placement Tips */}
              <div className="bg-[#E6F0EF] border border-[#B5D2D0] rounded-xl p-4">
                <p className="text-xs font-bold text-[#06525C] mb-1">💡 Placement Tip</p>
                <p className="text-xs text-[#043F47] leading-relaxed">
                  Always optimize your resume using the X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]" to pass ATS reviews.
                </p>
              </div>

            </aside>
          </div>

          {/* MOBILE SLIDE-OUT DRAWERS */}
          {/* 1. Left drawer: Filters */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="fixed inset-0 bg-[#06525C]/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
              <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl overflow-y-auto p-5 animate-slide-in-left">
                <div className="flex items-center justify-between mb-4 border-b border-[#EBF0EE] pb-3 shrink-0">
                  <h3 className="font-bold text-sm text-[#06525C]">Filter Openings</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-xs font-bold text-[#2F737D]">✕ Close</button>
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
              <div className="fixed inset-0 bg-[#06525C]/40 backdrop-blur-sm" onClick={() => setMobileCompanyOpen(false)} />
              <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl overflow-y-auto p-5 animate-slide-in-right">
                <div className="flex items-center justify-between mb-4 border-b border-[#EBF0EE] pb-3 shrink-0">
                  <h3 className="font-bold text-sm text-[#06525C]">Companies & Insights</h3>
                  <button onClick={() => setMobileCompanyOpen(false)} className="p-1 text-xs font-bold text-[#2F737D]">✕ Close</button>
                </div>
                <div className="space-y-5 flex-1">
                  {/* Popular Companies */}
                  <div className="border border-[#D5E1DF] rounded-xl p-4 shadow-sm bg-white">
                    <h3 className="text-xs font-bold text-[#06525C] uppercase tracking-wider mb-3">Popular Companies</h3>
                    <div className="divide-y divide-[#EBF0EE] -mx-1">
                      {POPULAR_COMPANIES.map((c) => (
                        <CompanyPill key={c.name} name={c.name} color={c.color} onClick={() => setMobileCompanyOpen(false)} />
                      ))}
                    </div>
                  </div>
                  {/* Quick Stats */}
                  <div className="border border-[#D5E1DF] rounded-xl p-4 shadow-sm bg-white">
                    <h3 className="text-xs font-bold text-[#06525C] uppercase tracking-wider mb-2.5">Quick Stats</h3>
                    <div className="space-y-2 text-xs text-[#2A6870]">
                      <div className="flex justify-between">
                        <span>Active Jobs:</span>
                        <span className="font-bold text-[#06525C]">{jobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remote Roles:</span>
                        <span className="font-bold text-[#A16207]">{jobs.filter(j => j.workMode === 'Remote' || j.isRemote).length}</span>
                      </div>
                    </div>
                  </div>
                  {/* Placement Tip */}
                  <div className="bg-[#E6F0EF] border border-[#B5D2D0] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#06525C] mb-1">💡 Placement Tip</p>
                    <p className="text-xs text-[#043F47] leading-relaxed">
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
