import React from 'react';
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brandPrimary">
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </svg>
);

export default function Navbar({ jobsCount }) {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-darkBorder px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <BriefcaseIcon />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Intern<span className="text-brandSecondary">Pulse</span>
              </span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandSecondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brandSecondary"></span>
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Real-time Internship Aggregator</p>
          </div>
        </div>

        {/* Status Indicators and Metrics */}
        <div className="flex items-center gap-4 text-sm">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 rounded-lg border border-darkBorder">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-slate-400 text-xs">APIs: Remotive & Arbeitnow</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <span className="text-indigo-400 font-bold text-xs">
              {jobsCount !== undefined ? `${jobsCount} Postings` : 'Loading...'}
            </span>
          </div>
        </div>
        
      </div>
    </nav>
  );
}
