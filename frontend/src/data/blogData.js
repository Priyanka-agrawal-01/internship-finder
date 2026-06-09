// ─── Blog Data ────────────────────────────────────────────────────────────────

export const BLOG_CATEGORIES = ['All','Resume','Internships','DSA','Interview','Career','Roadmap','Company Guide'];

export const BLOG_POSTS = [
  {
    id: 'first-internship',
    slug: 'how-to-get-your-first-internship',
    title: 'How To Get Your First Internship as a CS/ECE Student',
    excerpt: 'A step-by-step guide covering everything from building your first project to cold-emailing recruiters and acing your first technical round.',
    category: 'Internships',
    readTime: '9 min',
    date: '2026-06-01',
    featured: true,
    emoji: '🎯',
    tags: ['Beginner', 'Off-Campus', 'Projects', 'Cold Email'],
    author: 'Priyanka Agrawal',
    content: `Getting your first internship feels impossible until it isn't. Here's the truth: most students overcomplicate it. This guide breaks it into 5 actionable phases.

**Phase 1 — Build Something Real (Weeks 1–4)**
Pick one project that solves a real problem. It doesn't need to be revolutionary. A job portal, a expense tracker, a local business website — what matters is that it's deployed, has a GitHub README, and you can explain every line.

**Phase 2 — Fix Your Digital Presence (Week 5)**
Your LinkedIn headline should not say "student at XYZ University." It should say "Full Stack Developer | React · Node.js | Building InternPulse." Your GitHub should have at least 2 pinned repos with stars on the README.

**Phase 3 — Apply Strategically (Weeks 6–10)**
Don't spray and pray. Apply to 5–10 companies per week with personalised cover notes. Use Internshala for startups, LinkedIn for mid-size companies, and company career portals for MNCs.

**Phase 4 — Cold Email That Works**
Find the hiring manager or engineering lead on LinkedIn. Email them directly: "Hi [Name], I'm a 3rd year CSE student who built [X]. I noticed you're hiring interns and I'd love to contribute to [specific team]. Here's my work: [link]. Worth a 15-minute chat?"

**Phase 5 — The Interview**
For startups: focus on projects and problem-solving attitude. For MNCs: DSA is non-negotiable. Prepare arrays, strings, hashmaps, trees, and graphs. Use Striver's SDE Sheet.`,
  },
  {
    id: 'google-prep',
    slug: 'google-internship-preparation-guide',
    title: 'Google Internship Preparation — The Complete Guide',
    excerpt: 'Everything you need to crack the Google SWE internship: from FANG-level DSA practice to system design basics and behavioural interview tips.',
    category: 'Company Guide',
    readTime: '14 min',
    date: '2026-05-28',
    featured: true,
    emoji: '🔍',
    tags: ['Google', 'FAANG', 'DSA', 'System Design'],
    author: 'Priyanka Agrawal',
    content: `Google's internship interview process is rigorous but predictable once you understand the pattern.

**The Process**
1. Online application via careers.google.com
2. 1–2 coding rounds (45 mins each, Google Docs or Coderpad)
3. For SWE interns: 2 technical interviews focused on DSA

**What Google Actually Tests**
- Data structures: Arrays, HashMaps, Trees, Graphs, Heaps
- Algorithms: BFS/DFS, Binary Search, Dynamic Programming, Sliding Window
- Communication: Can you explain your thought process clearly?
- Optimisation: Can you go from O(n²) to O(n log n)?

**6-Month Preparation Timeline**
Months 1–2: Master arrays, strings, hashmaps, two pointers
Months 3–4: Trees, graphs, BFS/DFS, recursion, backtracking
Months 5–6: Dynamic programming, system design basics, mock interviews

**Resources**
- Striver's A2Z DSA Course (free, comprehensive)
- Blind 75 problems on LeetCode
- Elements of Programming Interviews (book)
- Mock interviews with Pramp or Interviewing.io`,
  },
  {
    id: 'amazon-interview',
    slug: 'amazon-interview-experience',
    title: 'Amazon SDE Intern Interview Experience — Bangalore 2025',
    excerpt: 'A real interview experience at Amazon India — the exact questions asked, how I prepared, and what I wish I\'d known before walking in.',
    category: 'Interview',
    readTime: '7 min',
    date: '2026-05-20',
    featured: false,
    emoji: '📦',
    tags: ['Amazon', 'Experience', 'SDE', 'OA'],
    author: 'Priyanka Agrawal',
    content: `I interviewed for the Amazon SDE Intern role at the Bangalore office. Here's exactly what happened.

**Round 1 — Online Assessment (90 mins)**
2 coding problems on HackerRank. Problem 1 was a medium-level array manipulation. Problem 2 was a graph BFS problem. Both had edge cases that tripped me up in practice — make sure you test empty inputs and single-element cases.

**Round 2 — Technical Interview (60 mins)**
The interviewer asked me to implement a LRU Cache from scratch. Then asked follow-up questions about time complexity. After coding, she asked about Leadership Principles — specifically "Customer Obsession" and "Dive Deep."

**Round 3 — Bar Raiser (45 mins)**
This round is specifically designed to evaluate culture fit. Questions were behavioural: "Tell me about a time you disagreed with a teammate," "Describe a project where you had to make a decision with incomplete information." Use STAR format strictly.

**What I Wish I'd Known**
Study Amazon's 16 Leadership Principles. Have 2 stories per principle ready. LPs are not optional — they're core to Amazon's hiring.`,
  },
  {
    id: 'resume-mistakes',
    slug: 'resume-mistakes-students-make',
    title: '10 Resume Mistakes That Are Costing You Internship Calls',
    excerpt: 'The most common resume blunders Indian CS/ECE students make — and exactly how to fix each one to dramatically improve your callback rate.',
    category: 'Resume',
    readTime: '6 min',
    date: '2026-05-15',
    featured: true,
    emoji: '⚠️',
    tags: ['Resume', 'ATS', 'Common Mistakes', 'Tips'],
    author: 'Priyanka Agrawal',
    content: `After reviewing 200+ student resumes, the same mistakes appear again and again.

**Mistake 1 — Objectives Instead of Summary**
Nobody cares that you "seek a challenging role." Write a 2-line profile: "3rd year CSE student with expertise in React and Node.js. Built 3 deployed projects with 500+ GitHub stars. Seeking SDE intern role."

**Mistake 2 — Using Tables or Multiple Columns**
ATS systems can't parse tables. Use a simple single-column layout. Times New Roman is fine. Calibri 10pt is fine. Tables are not.

**Mistake 3 — Describing Duties Instead of Impact**
Bad: "Worked on a todo app using React."
Good: "Built a collaborative todo app with real-time sync using React and Firebase, used by 200+ students in my college."

**Mistake 4 — Listing Every Technology You've Touched**
Don't list HTML as a skill in 2025. Don't list MS Word. Only list technologies you can comfortably code in during an interview.

**Mistake 5 — No GitHub/Portfolio Link**
This is the most common and most costly. If you don't have a GitHub with at least 2 projects, that's your homework for this weekend.

**Mistakes 6–10**: Wrong font size (use 10–11pt), no quantified achievements, education placed after experience (put it first if you're a student), generic project titles ("E-Commerce Website"), and spelling errors.`,
  },
  {
    id: 'dsa-questions',
    slug: 'top-dsa-questions-for-placements',
    title: 'Top DSA Questions Every Student Must Solve Before Placements',
    excerpt: 'The 50 most frequently asked DSA questions in Indian tech placements — organised by topic with difficulty levels and expected approach.',
    category: 'DSA',
    readTime: '11 min',
    date: '2026-05-10',
    featured: false,
    emoji: '🧩',
    tags: ['DSA', 'Must-Do', 'Placements', 'LeetCode'],
    author: 'Priyanka Agrawal',
    content: `These questions appear across Google, Amazon, Microsoft, Flipkart, Adobe, and virtually every other tech company's intern interviews.

**Arrays & Strings (Start Here)**
- Two Sum (HashMap approach)
- Maximum subarray (Kadane's algorithm)  
- Rotate Array
- Longest substring without repeating characters
- Anagram groups

**LinkedList**
- Reverse a linked list
- Detect cycle (Floyd's algorithm)
- Merge two sorted lists
- Remove Nth node from end

**Trees**
- Level-order traversal
- Maximum depth
- Lowest common ancestor
- Validate BST
- Diameter of binary tree

**Dynamic Programming (Most Commonly Tested)**
- Climbing stairs
- House robber
- Longest common subsequence
- 0/1 Knapsack
- Coin change

**Graphs**
- Number of islands (BFS/DFS)
- Course schedule (Topological sort)
- Shortest path (Dijkstra's)

**Practice Order**: Arrays → Strings → HashMap → LinkedList → Trees → Graphs → DP. Do not skip. DP is terrifying until you've done 20 problems — then it clicks.`,
  },
  {
    id: 'off-campus-roadmap',
    slug: 'complete-off-campus-roadmap',
    title: 'Complete Off-Campus Placement Roadmap for 2025–26',
    excerpt: 'A practical, month-by-month strategy to land an off-campus internship or job even if your college has limited campus placements.',
    category: 'Career',
    readTime: '12 min',
    date: '2026-05-05',
    featured: false,
    emoji: '🗺️',
    tags: ['Off-Campus', 'Strategy', 'Timeline', 'Placements'],
    author: 'Priyanka Agrawal',
    content: `Most placement advice assumes you have campus placements. Here's a roadmap for everyone else.

**Month 1–2: Foundation**
- Fix your GitHub (2 deployed projects minimum)
- Complete your LinkedIn profile (All-Star rating)
- Start DSA — 2 problems per day from Striver's Sheet
- Join Unstop, Internshala, and LinkedIn Jobs alerts

**Month 3–4: Skill Building**
- Pick one domain: Frontend, Backend, ML, Data Science, or VLSI
- Build a domain-specific project
- Contribute to 1 open source project (even documentation counts)
- Attend online hackathons on Devfolio and Unstop

**Month 5–6: Active Applications**
- Apply to 5–8 companies per week (not 50 — quality over volume)
- Personalise every application with a specific note
- Cold email 3 professionals per week using the template above
- Apply via employee referrals on LinkedIn — ask alumni from your college

**Month 7–8: Interview Season**
- Mock interviews: Pramp (free), Interviewing.io, your study group
- Practice behavioral stories using STAR for top 10 LP questions
- Negotiate: always ask for stipend range before accepting

**Platforms Ranked by ROI**
1. LinkedIn Jobs (best for MNCs and referrals)
2. Unstop (best for contests that lead to PPIs)
3. Internshala (best for startups)
4. Company career portals (best for big tech)
5. Naukri (best for mass applications)`,
  },
  {
    id: 'frontend-roadmap',
    slug: 'frontend-developer-roadmap-2025',
    title: 'Frontend Developer Roadmap 2025 — From Zero to Hired',
    excerpt: 'The exact path to becoming a frontend developer who lands internships at product companies — skills, projects, and timeline included.',
    category: 'Roadmap',
    readTime: '16 min',
    date: '2026-04-28',
    featured: false,
    emoji: '🎨',
    tags: ['Frontend', 'React', 'TypeScript', 'Roadmap'],
    author: 'Priyanka Agrawal',
    content: `Frontend development is one of the fastest paths to your first tech internship. Here's the complete roadmap.

**Level 1 — Core Web (4 weeks)**
HTML5 semantics, CSS Flexbox and Grid, Responsive design, Basic JavaScript (variables, functions, DOM manipulation). Build: A personal portfolio website.

**Level 2 — JavaScript Mastery (6 weeks)**
ES6+ features, Async/Await and Promises, Fetch API, Array methods (map, filter, reduce), Browser storage. Build: A weather app using a public API.

**Level 3 — React (8 weeks)**
Components, Props, State, useEffect, React Router, Context API, Custom hooks. Build: A full CRUD application (todo/notes/expense tracker).

**Level 4 — Ecosystem (4 weeks)**
TypeScript basics, Tailwind CSS, Git and GitHub, Vite, Basic testing with Jest. Build: A clone of a real product (Notion, Linear, or Trello).

**Level 5 — Job Ready (Ongoing)**
Performance optimization, Accessibility, Web Vitals, Next.js basics, System design for frontend.

**Portfolio Projects That Impress Interviewers**
1. Real-time collaborative editor (WebSockets)
2. E-commerce with payment integration (Razorpay)
3. Dashboard with live charts (Recharts/D3)`,
  },
  {
    id: 'backend-roadmap',
    slug: 'backend-developer-roadmap-2025',
    title: 'Backend Developer Roadmap 2025 — Build APIs That Scale',
    excerpt: 'Complete guide to becoming a backend developer — from REST API basics to databases, authentication, and cloud deployment.',
    category: 'Roadmap',
    readTime: '17 min',
    date: '2026-04-20',
    featured: false,
    emoji: '⚙️',
    tags: ['Backend', 'Node.js', 'Databases', 'APIs'],
    author: 'Priyanka Agrawal',
    content: `Backend development powers every app you use. Here's how to build expertise that companies pay for.

**Level 1 — Programming Foundation**
Choose one language: Node.js (most startup jobs), Java (most MNC jobs), or Python (ML-adjacent roles). Master functions, classes, error handling, and file I/O.

**Level 2 — APIs and HTTP**
How HTTP works (methods, status codes, headers), REST API design principles, Build a CRUD REST API with Express.js or Spring Boot, API authentication (JWT, sessions).

**Level 3 — Databases**
SQL basics: SELECT, JOIN, GROUP BY, indexes. PostgreSQL or MySQL. NoSQL: MongoDB documents, queries, aggregation. When to use which: relational data → SQL, flexible documents → MongoDB.

**Level 4 — Real-World Systems**
Environment variables and configuration, Deployment on Railway/Render/AWS EC2, Docker basics (Dockerfile, docker-compose), Caching with Redis, Message queues basics.

**Level 5 — Architecture**
Microservices vs monolith, Load balancing concepts, Database design and normalization, Rate limiting and security (CORS, helmet, input validation).

**Projects to Build**
1. URL shortener (covers routing, databases, Redis caching)
2. Authentication service (JWT, OAuth, refresh tokens)
3. Real-time chat API (WebSockets, rooms, message persistence)`,
  },
];
