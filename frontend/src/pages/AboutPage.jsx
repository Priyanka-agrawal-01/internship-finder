import React from 'react';

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 mt-0.5">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* ─── Platform stats ────────────────────────────────────────────────────────── */
const PLATFORM_FEATURES = [
  { emoji: '🔄', title: 'Real-Time Job Aggregation', desc: 'Fetches from Remotive, Arbeitnow, The Muse, and more — refreshed every 30 minutes.' },
  { emoji: '🇮🇳', title: 'India-Focused', desc: 'All listings are filtered to India specifically — Bangalore, Hyderabad, Pune, Delhi, and remote India roles.' },
  { emoji: '🔔', title: 'Smart Job Alerts', desc: 'Subscribe and receive email alerts every 6 hours when new matching internships are detected.' },
  { emoji: '🏢', title: '77+ Verified Companies', desc: 'Curated directory of IT and ECE companies with stipend ranges, career links, and hiring domains.' },
  { emoji: '📚', title: 'Preparation Hub', desc: 'Resources for resume writing, DSA, development roadmaps, interview prep, and career strategy.' },
  { emoji: '🎯', title: 'Deduplication Engine', desc: 'Smart deduplication removes duplicate listings from different sources so you only see unique openings.' },
];

const HOW_IT_HELPS = [
  'Find internships from multiple platforms without visiting each one separately',
  'Discover roles from companies that rarely post on Internshala',
  'Get notified the moment a new listing appears — before it closes',
  'Prepare with curated DSA, resume, and interview guides in one place',
  'Explore 77+ verified companies with direct career page links',
  'Filter by domain, company, location, and role type instantly',
];

/* ─── Founder avatar ────────────────────────────────────────────────────────── */
function FounderAvatar() {
  return (
    <div className="relative shrink-0">
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl font-extrabold text-white"
        style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}>
        PA
      </div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center border-2 border-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
    </div>
  );
}

/* ─── Main AboutPage ─────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            <span className="text-xs font-bold text-[#2563EB]">👋 Meet the Founder</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
            About InternPulse
          </h1>
          <p className="text-[#64748B] text-lg max-w-2xl leading-relaxed">
            A placement platform built by a student, for students — because finding a good internship shouldn't be this hard.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Founder card ─────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden"
          style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-0">
            {/* Left — avatar + links */}
            <div className="p-8 flex flex-col items-center gap-5 border-b md:border-b-0 md:border-r border-[#E2E8F0] bg-[#FAFBFD] md:min-w-[220px]">
              <FounderAvatar />
              <div className="text-center">
                <h2 className="text-lg font-extrabold text-[#0F172A]">Priyanka Agrawal</h2>
                <p className="text-xs text-[#64748B] mt-1">Electronics & Communication · Full Stack Dev</p>
                <p className="text-xs font-semibold text-[#2563EB] mt-1">Founder, InternPulse</p>
              </div>
              {/* Social links */}
              <div className="flex flex-col gap-2 w-full">
                <a href="https://github.com/Priyanka-agrawal-01"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-semibold hover:bg-[#1E293B] transition-colors">
                  <GithubIcon /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/priyanka-agrawal"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-[#0A66C2] text-white rounded-xl text-xs font-semibold hover:bg-[#0950A0] transition-colors">
                  <LinkedinIcon /> LinkedIn
                </a>
                <a href="mailto:priyanka@internpulse.co"
                  className="flex items-center gap-2.5 px-3 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors bg-white">
                  <MailIcon /> Email Me
                </a>
              </div>
            </div>

            {/* Right — bio */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 rounded-full bg-[#2563EB]" />
                <h3 className="text-base font-extrabold text-[#0F172A]">About Me</h3>
              </div>

              <div className="space-y-3 text-[#374151] text-[15px] leading-[1.8]">
                <p>
                  Hi, I'm <strong className="text-[#0F172A]">Priyanka Agrawal</strong>, an Electronics and Communication undergraduate passionate about web development, software engineering, problem solving, and building products that help students discover better career opportunities.
                </p>
                <p>
                  <strong className="text-[#0F172A]">InternPulse</strong> was created to simplify internship discovery and make placement preparation more accessible for students. I noticed that finding quality internships required visiting a dozen different platforms, manually filtering through hundreds of unrelated listings, and never knowing when new openings appeared.
                </p>
                <p>
                  So I built InternPulse — a single platform that aggregates listings from multiple real-time sources, filters them specifically for India, sends alerts the moment new openings appear, and provides all the preparation resources a student needs in one place.
                </p>
              </div>

              {/* Skills / interests */}
              <div className="mt-5 pt-5 border-t border-[#F1F5F9]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Interests & Skills</p>
                <div className="flex flex-wrap gap-2">
                  {['Full Stack Development','React & Node.js','Problem Solving','ECE / VLSI','Open Source','Product Thinking','DSA','System Design'].map(s => (
                    <span key={s} className="px-3 py-1 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About InternPulse ─────────────────────────────────────────────── */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-8"
          style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 rounded-full bg-[#22C55E]" />
            <h2 className="text-xl font-extrabold text-[#0F172A]">What is InternPulse?</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-[15px] text-[#374151] leading-[1.8] mb-4">
                InternPulse is a real-time internship aggregation platform built specifically for Indian students in CS, ECE, and related engineering disciplines.
              </p>
              <p className="text-[15px] text-[#374151] leading-[1.8]">
                Unlike generic job boards, InternPulse is focused on one goal: helping students at every stage — from building their first project to landing their first offer — with real-time job data, curated preparation resources, and intelligent job alerts.
              </p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">How InternPulse helps you</p>
              <ul className="space-y-2">
                {HOW_IT_HELPS.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-[#64748B] leading-relaxed">
                    <CheckIcon /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_FEATURES.map((f, i) => (
              <div key={i} className="border border-[#E2E8F0] rounded-xl p-4 bg-[#FAFBFD]">
                <div className="text-2xl mb-2">{f.emoji}</div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-1">{f.title}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Platform stats ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '77+',     label: 'Verified Companies', emoji: '🏢' },
            { value: '5',       label: 'Job API Sources',    emoji: '🔌' },
            { value: 'Every 6h',label: 'Alert Frequency',    emoji: '🔔' },
            { value: '100%',    label: 'Free Forever',       emoji: '❤️' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 text-center"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{s.value}</div>
              <div className="text-xs text-[#64748B] mt-1">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── Built with ────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-8"
          style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 rounded-full bg-[#7C3AED]" />
            <h2 className="text-xl font-extrabold text-[#0F172A]">Tech Stack</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              'React 18','Vite','Tailwind CSS','Node.js','Express.js',
              'MongoDB','Mongoose','node-cron','Nodemailer',
              'Remotive API','Arbeitnow API','The Muse API','Adzuna API',
            ].map(t => (
              <span key={t} className="px-3 py-1.5 text-xs font-semibold text-[#374151] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">{t}</span>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
            <p className="text-sm text-[#64748B]">Open source and built for learning. Contributions are welcome.</p>
            <a href="https://github.com/Priyanka-agrawal-01/internpulse"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors">
              <GithubIcon /> View on GitHub
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
