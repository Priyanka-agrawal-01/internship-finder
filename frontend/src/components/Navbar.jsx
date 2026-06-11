import React, { useState } from 'react';

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const UserCircleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="8" r="3"/>
    <path d="M6.2 20a6 6 0 0 1 11.6 0"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ─── Nav config ─────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',       page: 'home'       },
  { label: 'Jobs',       page: 'jobs'       },
  { label: 'Companies',  page: 'companies', badge: '77' },
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
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2 shrink-0 focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <BriefcaseIcon />
            </div>
            <span className="text-[#0F172A] font-bold text-lg tracking-tight">
              Intern<span className="text-[#2563EB]">Pulse</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = currentPage === link.page;
              return (
                <button key={link.label} onClick={() => navigate(link.page)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    active ? 'text-[#2563EB] bg-[#EFF6FF] font-semibold' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}>
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: active ? '#2563EB' : '#E2E8F0', color: active ? 'white' : '#64748B' }}>
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
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg transition-colors duration-150">
              Get Alerts
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => {
            const active = currentPage === link.page;
            return (
              <button key={link.label} onClick={() => navigate(link.page)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active ? 'text-[#2563EB] bg-[#EFF6FF] font-semibold' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}>
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-bold bg-[#2563EB] text-white px-1.5 py-0.5 rounded-full">{link.badge}</span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] rounded-full border border-[#BBF7D0] w-fit">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block"/>
              <span className="text-xs font-semibold text-[#16A34A]">{jobsCount} Active Jobs</span>
            </div>
            <button onClick={() => { onSubscribeClick?.(); setMobileOpen(false); }}
              className="w-full px-4 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-lg">
              Get Job Alerts
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
