import { useState } from 'react';

/* ─── Icons ────────────────────────────────────────────────────────────────── */
/* the InternPulse mark (three stacked bars), as on the landing page and the favicon */
const StackMark = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#06525C" aria-hidden="true">
    <rect x="2" y="2.5" width="20" height="5.5" rx="2.75"/>
    <rect x="2" y="9.25" width="14" height="5.5" rx="2.75"/>
    <rect x="2" y="16" width="8" height="5.5" rx="2.75"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F737D" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F737D" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ─── Nav config ─────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',       page: 'home'       },
  { label: 'Jobs',       page: 'jobs'       },
  { label: 'Companies',  page: 'companies', badge: '80' },
  { label: 'Resources',  page: 'resources'  },
  { label: 'Blog',       page: 'blog'       },
  { label: 'Alerts',     page: 'alerts'     },
  { label: 'About',      page: 'about'      },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Navbar({ jobsCount = 0, currentPage = 'home', onNavigate, onSubscribeClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (page) => {
    onNavigate?.(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D5E1DF]"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2 shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06525C] focus-visible:ring-offset-2">
            <StackMark />
            <span className="text-[#06525C] font-semibold text-lg tracking-tight">InternPulse</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = currentPage === link.page;
              return (
                <button key={link.label} onClick={() => navigate(link.page)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    active ? 'text-[#06525C] bg-[#E6F0EF] font-semibold' : 'text-[#2F737D] hover:text-[#06525C] hover:bg-[#F7F9F8]'
                  }`}>
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: active ? '#06525C' : '#D5E1DF', color: active ? 'white' : '#2F737D' }}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] rounded-full border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] badge-new inline-block"/>
              <span className="text-xs font-semibold text-[#16A34A]">{jobsCount} Active Jobs</span>
            </div>
            <button onClick={onSubscribeClick}
              className="px-4 py-2 bg-[#06525C] hover:bg-[#043F47] text-white text-sm font-semibold rounded-lg transition-colors duration-150">
              Get Alerts
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-[#EBF0EE] transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#D5E1DF] bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => {
            const active = currentPage === link.page;
            return (
              <button key={link.label} onClick={() => navigate(link.page)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active ? 'text-[#06525C] bg-[#E6F0EF] font-semibold' : 'text-[#2F737D] hover:text-[#06525C] hover:bg-[#F7F9F8]'
                }`}>
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-bold bg-[#06525C] text-white px-1.5 py-0.5 rounded-full">{link.badge}</span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#D5E1DF] space-y-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] rounded-full border border-[#BBF7D0] w-fit">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block"/>
              <span className="text-xs font-semibold text-[#16A34A]">{jobsCount} Active Jobs</span>
            </div>
            <button onClick={() => { onSubscribeClick?.(); setMobileOpen(false); }}
              className="w-full px-4 py-2.5 bg-[#06525C] text-white text-sm font-semibold rounded-lg">
              Get Job Alerts
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
