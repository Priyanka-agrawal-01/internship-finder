import { createContext, useContext } from 'react';

export const SavedContext = createContext(null);

/**
 * Bookmarked and applied jobs and companies: { items, ready, isBookmarked(kind, id),
 * isApplied(kind, id), toggleBookmark(kind, id, data), toggleApplied(kind, id, data),
 * remove(kind, id), counts }. Kept in this browser for guests, in the account once signed in.
 */
export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used inside <SavedProvider>');
  return ctx;
}

/** What a saved job keeps from its card, so My Jobs can show it after it leaves the feed. */
export const jobData = job => ({
  title: job.title, company: job.company, location: job.location, country: job.country,
  workMode: job.workMode, isInternship: !!job.isInternship, url: job.url, source: job.source,
  tags: (job.tags || job.skills || []).slice(0, 8), stipend: job.stipend || '', postedAt: job.postedAt || null,
  logoUrl: job.logoUrl || '',
});

/** What a saved company keeps (the Companies page data). */
export const companyData = (company, tab = 'it') => ({
  name: company.name, category: company.category || [], location: company.location || [],
  stipend: company.stipend || '', url: company.careers || '', color: company.color || '', tab,
});
