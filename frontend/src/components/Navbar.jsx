import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/authContext';
import { useSaved } from '../saved/savedContext';

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
  { label: 'My Jobs',    page: 'myjobs',    savedCount: true },
  { label: 'About',      page: 'about'      },
  { label: 'Admin',      page: 'admin',     adminOnly: true },
];

const initialOf = user => (user?.name || user?.email || '?').trim()[0].toUpperCase();

/* ─── Account: Sign in, or the signed-in person's menu ───────────────────────── */
function AccountMenu({ onNavigate }) {
  const { status, user, openAuth, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!box.current?.contains(e.target)) setOpen(false); };
    const onKey  = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (status === 'loading') {
    return <span className="w-9 h-9 rounded-full bg-[#EBF0EE] animate-pulse" role="status" aria-label="Checking your sign-in" />;
  }
  if (status !== 'signedIn') {
    return (
      <button onClick={() => openAuth('signin')}
        className="px-4 py-2 text-sm font-semibold text-[#06525C] border border-[#C3D4D2] rounded-lg hover:border-[#06525C] transition-colors">
        Sign in
      </button>
    );
  }
  const item = 'w-full text-left px-3 py-2 rounded-lg text-sm text-[#06525C] hover:bg-[#F7F9F8]';
  return (
    <div className="relative" ref={box}>
      <button onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={`Account menu for ${user.name}`}
        className="w-9 h-9 rounded-full bg-[#06525C] text-white text-sm font-semibold grid place-items-center hover:bg-[#043F47] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06525C] focus-visible:ring-offset-2">
        {initialOf(user)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 bg-white border border-[#D5E1DF] rounded-xl shadow-lg p-1.5 z-50">
          <div className="px-3 py-2 border-b border-[#EBF0EE] mb-1">
            <p className="text-sm font-semibold text-[#06525C] truncate">{user.name}</p>
            <p className="text-xs text-[#2F737D] truncate">{user.email}</p>
          </div>
          <button role="menuitem" className={item} onClick={() => { setOpen(false); onNavigate('myjobs'); }}>My Jobs</button>
          <button role="menuitem" className={item} onClick={() => { setOpen(false); onNavigate('alerts'); }}>Job alerts</button>
          {user.role === 'admin' && <button role="menuitem" className={item} onClick={() => { setOpen(false); onNavigate('admin'); }}>Admin panel</button>}
          <button role="menuitem" className={item} onClick={() => { setOpen(false); signOut(); }}>Sign out</button>
        </div>
      )}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Navbar({ jobsCount = 0, currentPage = 'home', onNavigate, onSubscribeClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status, user, openAuth, signOut } = useAuth();
  const { items } = useSaved();

  const navigate = (page) => {
    onNavigate?.(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const badgeOf = link => (link.savedCount ? (items.length ? String(items.length) : null) : link.badge);
  const links = NAV_LINKS.filter(l => !l.adminOnly || user?.role === 'admin');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D5E1DF]"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2 shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06525C] focus-visible:ring-offset-2">
            <StackMark />
            <span className="text-[#06525C] font-semibold text-lg tracking-tight">InternPulse</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {links.map(link => {
              const active = currentPage === link.page;
              const badge = badgeOf(link);
              return (
                <button key={link.label} onClick={() => navigate(link.page)} aria-current={active ? 'page' : undefined}
                  className={`${link.adminOnly ? 'hidden xl:flex' : 'flex'} items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 whitespace-nowrap ${
                    active ? 'text-[#06525C] bg-[#E6F0EF] font-semibold' : 'text-[#2F737D] hover:text-[#06525C] hover:bg-[#F7F9F8]'
                  }`}>
                  {link.label}
                  {badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: active ? '#06525C' : '#D5E1DF', color: active ? 'white' : '#2F737D' }}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] rounded-full border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] badge-new inline-block"/>
              <span className="text-xs font-semibold text-[#16A34A]">{jobsCount} Active Jobs</span>
            </div>
            <button onClick={onSubscribeClick}
              className="px-4 py-2 bg-[#06525C] hover:bg-[#043F47] text-white text-sm font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap">
              Get Alerts
            </button>
            <AccountMenu onNavigate={navigate} />
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-[#EBF0EE] transition-colors" onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#D5E1DF] bg-white px-4 py-3 space-y-1 max-h-[calc(100vh-64px)] overflow-y-auto">
          {links.map(link => {
            const active = currentPage === link.page;
            const badge = badgeOf(link);
            return (
              <button key={link.label} onClick={() => navigate(link.page)} aria-current={active ? 'page' : undefined}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active ? 'text-[#06525C] bg-[#E6F0EF] font-semibold' : 'text-[#2F737D] hover:text-[#06525C] hover:bg-[#F7F9F8]'
                }`}>
                {link.label}
                {badge && (
                  <span className="text-[10px] font-bold bg-[#06525C] text-white px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
              </button>
            );
          })}
          <div className="pt-3 mt-2 border-t border-[#D5E1DF] space-y-2">
            {status === 'signedIn' ? (
              <div className="flex items-center gap-3 px-1">
                <span className="w-9 h-9 rounded-full bg-[#06525C] text-white text-sm font-semibold grid place-items-center shrink-0">{initialOf(user)}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#06525C] truncate">{user.name}</span>
                  <span className="block text-xs text-[#2F737D] truncate">{user.email}</span>
                </span>
                <button onClick={() => { setMobileOpen(false); signOut(); }} className="px-3 py-1.5 text-sm font-semibold text-[#06525C] border border-[#C3D4D2] rounded-lg">Sign out</button>
              </div>
            ) : status === 'guest' && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setMobileOpen(false); openAuth('signin'); }} className="px-4 py-2.5 text-sm font-semibold text-[#06525C] border border-[#C3D4D2] rounded-lg">Sign in</button>
                <button onClick={() => { setMobileOpen(false); openAuth('signup'); }} className="px-4 py-2.5 text-sm font-semibold text-[#06525C] border border-[#C3D4D2] rounded-lg">Create account</button>
              </div>
            )}
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
