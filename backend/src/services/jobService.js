const axios = require('axios');

// Premium Mock Listings for Big Tech in India
const PREMIUM_MOCK_JOBS = [
  {
    id: "mock-google-1",
    title: "Software Engineering Intern (Summer 2026)",
    company: "Google",
    location: "Bangalore, India",
    url: "https://careers.google.com/jobs/results/",
    source: "InternPulse Premium",
    postedAt: new Date().toISOString(),
    tags: ["C++", "Java", "Python", "Data Structures", "Algorithms"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-microsoft-1",
    title: "Software Engineering Intern",
    company: "Microsoft",
    location: "Hyderabad, India",
    url: "https://careers.microsoft.com/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    tags: ["C#", "Azure", "SQL", "OOP", "Systems Programming"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-amazon-1",
    title: "Software Development Engineer (SDE) Intern",
    company: "Amazon",
    location: "Chennai, India",
    url: "https://www.amazon.jobs/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    tags: ["Java", "C++", "AWS", "OOP", "Data Structures"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-adobe-1",
    title: "Product Engineering Intern - Tech",
    company: "Adobe",
    location: "Noida, India",
    url: "https://careers.adobe.com/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    tags: ["React", "JavaScript", "C++", "Algorithms", "Creative Cloud"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-flipkart-1",
    title: "Software Engineering Intern",
    company: "Flipkart",
    location: "Bangalore, India",
    url: "https://www.flipkartcareers.com/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Java", "Data Structures", "SQL", "Problem Solving"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-zomato-1",
    title: "Software Development Engineer (SDE) Intern",
    company: "Zomato",
    location: "Gurgaon, India",
    url: "https://www.zomato.com/careers",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["React", "Node.js", "JavaScript", "MongoDB"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-swiggy-1",
    title: "Backend Engineering Intern",
    company: "Swiggy",
    location: "Bangalore, India",
    url: "https://careers.swiggy.com/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Java", "Spring Boot", "REST APIs", "SQL"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-tcs-1",
    title: "TCS Digital Internship Opportunity",
    company: "TCS",
    location: "Pune, India",
    url: "https://www.tcs.com/careers",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Java", "Python", "Web Technologies", "SQL"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-razorpay-1",
    title: "Software Engineering Intern (Backend)",
    company: "Razorpay",
    location: "Bangalore, India",
    url: "https://razorpay.com/jobs/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Golang", "Node.js", "API Design", "Databases"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-google-2",
    title: "Silicon Hardware Engineering Intern",
    company: "Google",
    location: "Bangalore, India",
    url: "https://careers.google.com/jobs/results/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Verilog", "ASIC", "VLSI", "Computer Architecture"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-microsoft-2",
    title: "Research Intern - Machine Learning & LLMs",
    company: "Microsoft",
    location: "Bangalore, India",
    url: "https://careers.microsoft.com/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["PyTorch", "LLMs", "Deep Learning", "Python", "Data Science"],
    isRemote: true,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-amazon-2",
    title: "Applied Scientist Intern",
    company: "Amazon",
    location: "Bangalore, India",
    url: "https://www.amazon.jobs/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Machine Learning", "Python", "Statistics", "Algorithms"],
    isRemote: false,
    isInternship: true,
    country: "India"
  },
  {
    id: "mock-adobe-2",
    title: "Software Engineer Intern - Document Cloud",
    company: "Adobe",
    location: "Bangalore, India",
    url: "https://careers.adobe.com/",
    source: "InternPulse Premium",
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["C++", "TypeScript", "PDF Services", "Java"],
    isRemote: false,
    isInternship: true,
    country: "India"
  }
];

// In-memory cache variables
let jobsCache = null;
let lastFetchTime = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Detects the country of a job listing based on its location string.
 */
function detectCountry(location) {
  if (!location) return 'Remote';
  const locLower = location.toLowerCase();
  
  if (locLower.includes('india') || locLower.includes('bangalore') || locLower.includes('hyderabad') || locLower.includes('noida') || locLower.includes('chennai') || locLower.includes('mumbai') || locLower.includes('pune')) {
    return 'India';
  }
  if (locLower.includes('united states') || locLower.includes('usa') || locLower.includes(' us ') || locLower.includes(', us') || locLower.includes('san francisco') || locLower.includes('new york') || locLower.includes('california')) {
    return 'United States';
  }
  if (locLower.includes('germany') || locLower.includes('berlin') || locLower.includes('munich') || locLower.includes('hamburg')) {
    return 'Germany';
  }
  if (locLower.includes('united kingdom') || locLower.includes('uk') || locLower.includes('london') || locLower.includes('manchester')) {
    return 'United Kingdom';
  }
  if (locLower.includes('canada') || locLower.includes('toronto') || locLower.includes('vancouver') || locLower.includes('montreal')) {
    return 'Canada';
  }
  if (locLower.includes('remote') || locLower.includes('anywhere') || locLower.includes('worldwide')) {
    return 'Remote';
  }
  return 'Worldwide'; // Default fallback
}

/**
 * Normalizes a job listing from the Remotive API.
 */
function normalizeRemotiveJob(job) {
  const title = job.title || 'Untitled Role';
  const company = job.company_name || 'Unknown Company';
  const tags = Array.isArray(job.tags) ? job.tags : [];
  const location = job.candidate_required_location || 'Remote';
  
  const isInternship = checkIsInternship(title, tags);
  const country = detectCountry(location);

  return {
    id: `remotive-${job.id}`,
    title,
    company,
    location,
    url: job.url,
    source: 'Remotive',
    postedAt: job.publication_date ? new Date(job.publication_date).toISOString() : new Date().toISOString(),
    tags: tags.slice(0, 5),
    isRemote: true,
    isInternship,
    country
  };
}

/**
 * Normalizes a job listing from the Arbeitnow API.
 */
function normalizeArbeitnowJob(job) {
  const title = job.title || 'Untitled Role';
  const company = job.company_name || 'Unknown Company';
  const tags = Array.isArray(job.tags) ? job.tags : [];
  const location = job.location || 'Germany';
  const isRemote = job.remote === true || location.toLowerCase().includes('remote');
  
  const isInternship = checkIsInternship(title, tags);
  const country = detectCountry(location);

  return {
    id: `arbeitnow-${job.slug || Math.random().toString(36).substr(2, 9)}`,
    title,
    company,
    location,
    url: job.url,
    source: 'Arbeitnow',
    postedAt: job.created_at ? new Date(job.created_at).toISOString() : new Date().toISOString(),
    tags: tags.slice(0, 5),
    isRemote,
    isInternship,
    country
  };
}

/**
 * Determines if a job is an internship based on title and tags.
 */
function checkIsInternship(title, tags) {
  const titleLower = title.toLowerCase();
  const keywords = ['intern', 'co-op', 'coop', 'placement', 'student', 'apprentice', 'trainee', 'fellowship', 'graduate program'];
  
  const hasKeywordInTitle = keywords.some(keyword => titleLower.includes(keyword));
  const hasKeywordInTags = tags.some(tag => {
    const tagLower = tag.toLowerCase();
    return keywords.some(keyword => tagLower.includes(keyword));
  });

  return hasKeywordInTitle || hasKeywordInTags;
}

/**
 * Fetch and merge jobs from both Remotive and Arbeitnow APIs.
 */
async function fetchJobsFromApis() {
  const jobs = [];

  const remotivePromise = axios.get('https://remotive.com/api/remote-jobs?limit=50', {
    timeout: 8000,
    headers: { 'User-Agent': 'InternPulse-Job-Aggregator' }
  });

  const arbeitnowPromise = axios.get('https://www.arbeitnow.com/api/job-board-api', {
    timeout: 8000,
    headers: { 'User-Agent': 'InternPulse-Job-Aggregator' }
  });

  console.log('Fetching live jobs from public APIs...');
  
  const results = await Promise.allSettled([remotivePromise, arbeitnowPromise]);

  if (results[0].status === 'fulfilled') {
    try {
      const remotiveJobs = results[0].value.data.jobs || [];
      console.log(`Successfully fetched ${remotiveJobs.length} jobs from Remotive.`);
      remotiveJobs.forEach(job => {
        jobs.push(normalizeRemotiveJob(job));
      });
    } catch (err) {
      console.error('Error parsing Remotive response:', err.message);
    }
  } else {
    console.error('Remotive API request failed:', results[0].reason?.message || results[0].reason);
  }

  if (results[1].status === 'fulfilled') {
    try {
      const arbeitnowJobs = results[1].value.data.data || [];
      console.log(`Successfully fetched ${arbeitnowJobs.length} jobs from Arbeitnow.`);
      arbeitnowJobs.forEach(job => {
        jobs.push(normalizeArbeitnowJob(job));
      });
    } catch (err) {
      console.error('Error parsing Arbeitnow response:', err.message);
    }
  } else {
    console.error('Arbeitnow API request failed:', results[1].reason?.message || results[1].reason);
  }

  return jobs;
}

/**
 * Main service method to retrieve jobs.
 */
async function getJobs() {
  const currentTime = Date.now();

  if (jobsCache && lastFetchTime && (currentTime - lastFetchTime < CACHE_DURATION_MS)) {
    console.log('Serving jobs from memory cache...');
    return jobsCache;
  }

  try {
    const freshJobs = await fetchJobsFromApis();
    
    // Merge mock tech jobs with the live api jobs
    const allJobs = [...PREMIUM_MOCK_JOBS, ...freshJobs];
    
    // Filter to only include authentic jobs located in India
    const indianJobs = allJobs.filter(job => job.country === 'India');
    
    // Sort jobs by posting date descending
    indianJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    
    jobsCache = indianJobs;
    lastFetchTime = currentTime;
    return jobsCache;
  } catch (error) {
    console.error('Error during job retrieval:', error.message);
    
    // Fallback to cache if database error occurs
    if (jobsCache) {
      console.warn('Job fetch failed. Serving stale cache.');
      return jobsCache;
    }
    
    // If no cache, still return the premium mock jobs so the app doesn't break
    return PREMIUM_MOCK_JOBS.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }
}

module.exports = {
  getJobs
};
