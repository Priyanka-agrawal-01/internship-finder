import React, { useState } from 'react';
import { companyDatabase } from '../data/companyData';

// Inline SVGs for card icons
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mt-0.5 shrink-0">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export default function JobCard({ job, onSelectCompany }) {
  const { title, company, location, url, source, postedAt, tags, isRemote, isInternship } = job;
  const [showInfo, setShowInfo] = useState(false);

  // Retrieve company profile from database or construct fallback
  const cleanCompanyName = company ? company.trim() : '';
  const hasProfile = companyDatabase.hasOwnProperty(cleanCompanyName);
  const companyInfo = hasProfile ? companyDatabase[cleanCompanyName] : {
    description: `${company} is an active recruiter listing opportunities in India.`,
    linkedin: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`,
    unstop: `https://unstop.com/search?q=${encodeURIComponent(company)}`,
    internshala: `https://internshala.com/internships/keywords-${encodeURIComponent(company)}`,
    naukri: `https://www.naukri.com/${encodeURIComponent(company.toLowerCase().replace(/\s+/g, '-'))}-jobs`,
    resumeTips: [
      "Optimize your resume for Applicant Tracking Systems (ATS) by including relevant skills from the listing.",
      "Detail your experience in projects matching the required stack.",
      "Showcase problem-solving, algorithms, and data structure capabilities.",
      "Ensure links to your live projects and GitHub repositories are clear."
    ]
  };

  // Calculates relative posting time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  // Identifies if the post was created within the last 5 days
  const checkIfNew = (dateString) => {
    const date = new Date(dateString);
    const difference = Date.now() - date.getTime();
    const days = difference / (1000 * 3600 * 24);
    return days <= 5;
  };

  const isNew = checkIfNew(postedAt);

  return (
    <div className="group relative bg-darkCard border border-darkBorder hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium flex flex-col justify-between">
      
      {/* Background Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Source Badge */}
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
              source === 'Remotive' 
                ? 'bg-purple-950/40 text-purple-300 border border-purple-800/30' 
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/30'
            }`}>
              {source}
            </span>

            {/* Remote Status Badge */}
            {isRemote && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/30">
                Remote
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* "New" Badge */}
            {isNew && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider bg-brandSecondary/15 text-brandSecondary px-2 py-0.5 rounded border border-brandSecondary/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                New
              </span>
            )}

            {/* "Internship" Badge */}
            {isInternship && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/30">
                Internship
              </span>
            )}
          </div>
        </div>

        {/* Title & Company */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2">
          {title}
        </h3>
        <button
          onClick={() => onSelectCompany && onSelectCompany(company)}
          className="text-slate-300 hover:text-indigo-400 font-medium text-sm mt-1 text-left transition-colors duration-200 focus:outline-none"
        >
          {company}
        </button>

        {/* Meta Info: Location and Calendar */}
        <div className="flex flex-col gap-2 mt-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPinIcon />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarIcon />
            <span>{getRelativeTime(postedAt)}</span>
          </div>
        </div>
      </div>

      {/* Tags & Action Button */}
      <div className="mt-6 pt-4 border-t border-darkBorder flex flex-col gap-4">
        {/* Tags list */}
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, index) => (
              <span key={index} className="text-[11px] bg-slate-900 text-slate-400 px-2.5 py-1 rounded-lg border border-darkBorder/40">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="h-6" /> // Placeholder spacing
        )}

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 py-2.5 rounded-xl transition-all duration-200"
        >
          <span>{showInfo ? 'Hide Company Info' : 'View Company Info'}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${showInfo ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Application Link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-brandPrimary text-slate-200 hover:text-white font-semibold text-sm py-2.5 rounded-xl border border-darkBorder hover:border-brandPrimary transition-all duration-200"
        >
          <span>Apply Now</span>
          <ExternalLinkIcon />
        </a>

        {/* Expandable Company Spotlight Details */}
        {showInfo && (
          <div className="mt-4 pt-4 border-t border-darkBorder/60 space-y-4 text-xs">
            {/* Description */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">About Company</h4>
              <p className="text-slate-300 leading-relaxed font-light">{companyInfo.description}</p>
            </div>

            {/* Application Guidelines */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5">Resume Requirements</h4>
              <ul className="space-y-1.5">
                {companyInfo.resumeTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-1.5 text-slate-300 font-light">
                    <CheckIcon />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">Authentic Career Pages</h4>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={companyInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 text-[#0a66c2] border border-[#0a66c2]/10 py-2 rounded-lg font-bold text-[10px] transition-all"
                >
                  <LinkedInIcon />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={companyInfo.unstop}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 py-2 rounded-lg font-bold text-[10px] transition-all"
                >
                  <LinkIcon />
                  <span>Unstop</span>
                </a>
                <a
                  href={companyInfo.internshala}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 py-2 rounded-lg font-bold text-[10px] transition-all"
                >
                  <LinkIcon />
                  <span>Internshala</span>
                </a>
                <a
                  href={companyInfo.naukri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/10 py-2 rounded-lg font-bold text-[10px] transition-all"
                >
                  <LinkIcon />
                  <span>Naukri</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
