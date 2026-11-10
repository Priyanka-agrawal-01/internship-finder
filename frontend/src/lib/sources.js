// Where listings come from (the `source` on each job) and the badge colours for each.
// The backend's job service decides which of these return listings at a given time.
export const SOURCE_STYLES = {
  'Company careers': { bg: '#E6F0EF', text: '#06525C', border: '#B5D2D0', dot: '#06525C' },
  'JSearch':         { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', dot: '#059669' },
  'Himalayas':       { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD', dot: '#0284C7' },
  'Adzuna':          { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA', dot: '#EA580C' },
  'Jooble':          { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', dot: '#E11D48' },
  'Jobicy':          { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', dot: '#D97706' },
  'Remotive':        { bg: '#FEFCE8', text: '#A16207', border: '#FDE68A', dot: '#A16207' },
  'Arbeitnow':       { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', dot: '#16A34A' },
  'InternPulse':     { bg: '#E6F0EF', text: '#06525C', border: '#B5D2D0', dot: '#06525C' },
};

/** Every source name, India-focused ones first. */
export const ALL_SOURCES = ['Company careers', 'JSearch', 'Himalayas', 'Adzuna', 'Jooble', 'Jobicy', 'Remotive', 'Arbeitnow'];

export const styleOf = name => SOURCE_STYLES[name] ?? SOURCE_STYLES.InternPulse;
