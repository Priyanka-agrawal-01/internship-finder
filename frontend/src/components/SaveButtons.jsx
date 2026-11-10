/* The Bookmark and Applied toggles used on job cards and in My Jobs */

export function BookmarkIcon({ on, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Square icon button that bookmarks an item. */
export function BookmarkButton({ on, onClick, label = 'job' }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      aria-label={on ? `Remove ${label} from bookmarks` : `Bookmark this ${label}`}
      title={on ? 'Bookmarked' : 'Bookmark'}
      className={`shrink-0 w-9 h-9 grid place-items-center rounded-xl border transition-colors ${
        on ? 'bg-[#FEFCE8] border-[#FDE68A] text-[#A16207]' : 'bg-white border-[#D5E1DF] text-[#2F737D] hover:border-[#06525C] hover:text-[#06525C]'
      }`}>
      <BookmarkIcon on={on} />
    </button>
  );
}

/** "Mark applied" / "Applied" toggle. */
export function AppliedButton({ on, onClick, className = '' }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      title={on ? 'Click to unmark' : 'Mark as applied'}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
        on ? 'bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]' : 'bg-white border-[#C3D4D2] text-[#06525C] hover:border-[#06525C]'
      } ${className}`}>
      {on && <CheckIcon />}
      {on ? 'Applied' : 'Mark applied'}
    </button>
  );
}
