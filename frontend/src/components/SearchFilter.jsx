import React from 'react';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-red-400">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default function SearchFilter({
  searchTerm,
  setSearchTerm,
  selectedCompany,
  setSelectedCompany,
  selectedCity,
  setSelectedCity,
  jobType,
  setJobType,
  companies,
  cities,
  onReset
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl mb-8 border border-darkBorder">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Search Input (Takes 4 cols) */}
        <div className="lg:col-span-4 relative">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Search Jobs</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, company, tags..."
              className="w-full bg-slate-900/80 border border-darkBorder hover:border-slate-700 focus:border-brandPrimary text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Company Dropdown (Takes 3 cols) */}
        <div className="lg:col-span-3">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full bg-slate-900/80 border border-darkBorder hover:border-slate-700 focus:border-brandPrimary text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%2394a3b8' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '18px'
            }}
          >
            <option value="">All Companies</option>
            {companies.map((company, index) => (
              <option key={index} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        {/* City Dropdown (Takes 2 cols) */}
        <div className="lg:col-span-2">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-slate-900/80 border border-darkBorder hover:border-slate-700 focus:border-brandPrimary text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%2394a3b8' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '18px'
            }}
          >
            <option value="">All Cities</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type Toggle (Takes 2 cols) */}
        <div className="lg:col-span-2">
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Category</label>
          <div className="grid grid-cols-3 bg-slate-900/80 p-1 rounded-xl border border-darkBorder">
            <button
              type="button"
              onClick={() => setJobType('all')}
              className={`text-[10px] sm:text-xs py-2 rounded-lg font-medium transition-all duration-150 ${
                jobType === 'all'
                  ? 'bg-brandPrimary text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setJobType('internship')}
              className={`text-[10px] sm:text-xs py-2 rounded-lg font-medium transition-all duration-150 ${
                jobType === 'internship'
                  ? 'bg-brandPrimary text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intern
            </button>
            <button
              type="button"
              onClick={() => setJobType('remote')}
              className={`text-[10px] sm:text-xs py-2 rounded-lg font-medium transition-all duration-150 ${
                jobType === 'remote'
                  ? 'bg-brandPrimary text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Remote
            </button>
          </div>
        </div>

        {/* Reset Button (Takes 1 col) */}
        <div className="lg:col-span-1 flex items-end justify-center h-full pt-6 lg:pt-0">
          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-darkBorder hover:border-slate-600 text-slate-400 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center w-full lg:w-auto"
          >
            <TrashIcon />
          </button>
        </div>

      </div>
    </div>
  );
}
