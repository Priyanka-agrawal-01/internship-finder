import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import SearchFilter from './components/SearchFilter';
import JobCard from './components/JobCard';
import SubscribeForm from './components/SubscribeForm';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [jobType, setJobType] = useState('all'); // all, internship, remote
  const [companiesList, setCompaniesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Fetch jobs on mount
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/jobs`);
      if (response.data?.success) {
        const fetchedJobs = response.data.jobs || [];
        setJobs(fetchedJobs);
        setFilteredJobs(fetchedJobs);

        // Derive unique companies for the dropdown selector
        const companies = fetchedJobs.map((j) => j.company).filter(Boolean);
        const uniqueCompanies = [...new Set(companies)].sort();
        setCompaniesList(uniqueCompanies);

        // Derive unique cities for the city dropdown selector
        const cities = fetchedJobs.map((j) => {
          if (!j.location) return null;
          const parts = j.location.split(',');
          return parts[0].trim();
        }).filter(Boolean);
        const uniqueCities = [...new Set(cities)].sort();
        setCitiesList(uniqueCities);
      } else {
        throw new Error('API reported unsuccessful job retrieval.');
      }
    } catch (err) {
      console.error('Frontend error fetching jobs:', err);
      setError(
        err.response?.data?.message || 
        'Could not load job postings. Make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter computation logic
  useEffect(() => {
    let result = [...jobs];

    // 1. Text Search Filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (job) =>
          (job.title && job.title.toLowerCase().includes(query)) ||
          (job.company && job.company.toLowerCase().includes(query)) ||
          (job.location && job.location.toLowerCase().includes(query)) ||
          (job.tags && job.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // 2. Company Select Filter
    if (selectedCompany) {
      result = result.filter((job) => job.company === selectedCompany);
    }

    // 3. City Select Filter
    if (selectedCity) {
      result = result.filter((job) => {
        if (!job.location) return false;
        const city = job.location.split(',')[0].trim();
        return city === selectedCity;
      });
    }

    // 4. Category Toggle Filter
    if (jobType === 'internship') {
      result = result.filter((job) => job.isInternship === true);
    } else if (jobType === 'remote') {
      result = result.filter((job) => job.isRemote === true);
    }

    setFilteredJobs(result);
  }, [searchTerm, selectedCompany, selectedCity, jobType, jobs]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
    setSelectedCity('');
    setJobType('all');
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <Navbar jobsCount={jobs.length} />

        {/* Hero Section */}
        <header className="relative py-16 px-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Pulse Check Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Internship</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Find verified internships and junior-level roles aggregated in real-time from top-tier remote databases.
            </p>
          </div>
        </header>

        {/* Dashboard Grid Content */}
        <main className="max-w-7xl mx-auto px-6 pb-20">
          {/* Filters Panel */}
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            jobType={jobType}
            setJobType={setJobType}
            companies={companiesList}
            cities={citiesList}
            onReset={handleResetFilters}
          />

          {/* Jobs Listing Area */}
          <div>
            {loading ? (
              /* Premium Grid Loading Skeletons */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-slate-800 rounded w-16" />
                      <div className="h-4 bg-slate-800 rounded w-20" />
                    </div>
                    <div className="h-6 bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                    <div className="space-y-2 pt-4 border-t border-darkBorder/40">
                      <div className="h-3 bg-slate-800 rounded w-5/6" />
                      <div className="h-3 bg-slate-800 rounded w-2/3" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 bg-slate-800 rounded w-12" />
                      <div className="h-6 bg-slate-800 rounded w-12" />
                    </div>
                    <div className="h-10 bg-slate-800 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Sleek Error Banner */
              <div className="glass-panel border border-red-500/20 rounded-2xl p-8 text-center max-w-xl mx-auto">
                <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Error Connecting Server</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              /* No Results State */
              <div className="glass-panel border border-darkBorder rounded-2xl p-12 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Listings Found</h3>
                <p className="text-slate-400 text-sm mb-6">We couldn't find any positions matching your filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-indigo-500/20 transition-all duration-150"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Render Job Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} onSelectCompany={setSelectedCompany} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Subscription Footer Section */}
      <footer className="max-w-7xl mx-auto w-full px-6 pb-12">
        <SubscribeForm backendUrl={BACKEND_URL} />
        <div className="mt-12 text-center text-xs text-slate-500 border-t border-darkBorder/40 pt-6">
          <p>© {new Date().getFullYear()} InternPulse. Powered by public job endpoints. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
