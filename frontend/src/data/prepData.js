/**
 * Company Preparation Hub Data
 *
 * Based on: publicly available job descriptions, engineering blogs,
 * intern experience posts (LinkedIn, Reddit, Glassdoor), company career pages,
 * and recruiter guidance. NOT official hiring requirements.
 *
 * Importance levels: 'high' | 'medium' | 'low'
 * Hiring stages: ordered array of commonly reported stages
 */

// ─── Helper ───────────────────────────────────────────────────────────────────
const H = 'high', M = 'medium', L = 'low';

// ─── IT Companies ─────────────────────────────────────────────────────────────
export const IT_PREP = {

  google: {
    resumeStrategy: {
      preferredLength: '1 page (strictly enforced for < 5 years experience)',
      preferredProjects: ['Open-source contributions', 'Distributed systems', 'ML/AI research projects', 'Side products with measurable user impact'],
      keySkills: ['C++', 'Java', 'Python', 'Algorithms', 'Data Structures', 'System Design', 'Distributed Computing'],
      bulletExamples: [
        'Reduced API latency by 40% by implementing a custom caching layer using Redis, serving 2M+ daily requests.',
        'Built a search indexing pipeline processing 500K documents/day using Apache Beam.',
        'Optimized query execution plan in PostgreSQL, improving report generation speed by 3×.',
      ],
      commonMistakes: [
        'Vague bullet points like "worked on backend" — quantify everything',
        'Listing technologies without projects that demonstrate them',
        'Including irrelevant coursework or filler descriptions',
        'Multi-page resume for internship applications',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Rarely tested for non-frontend SWE roles' },
      backend:      { level: H, note: 'Core systems, APIs, distributed services' },
      dsa:          { level: H, note: 'Primary interview focus — LeetCode Hard expected' },
      database:     { level: M, note: 'SQL basics + distributed DB concepts' },
      cloud:        { level: M, note: 'GCP familiarity appreciated' },
      devops:       { level: L, note: 'Not a primary area for interns' },
      systemDesign: { level: H, note: 'Expected even at intern level for senior rounds' },
    },
    interviewFocus: ['Advanced DSA (Graphs, DP)', 'Problem Solving & Optimization', 'Algorithms (Sorting, Search, Hashing)', 'Coding Interviews (multiple rounds)', 'Behavioral (Googleyness)'],
    hiringProcess: ['Online Application', 'Online Coding Assessment (90 min, 2–3 problems)', 'Phone Screen (1 round)', 'Virtual On-site (3–5 rounds: DSA + Behavioral)', 'Offer & Host-matching'],
    projectIdeas: [
      { title: 'Distributed Key-Value Store', why: 'Mirrors Google Bigtable/Spanner — shows systems thinking' },
      { title: 'Search Engine (mini)', why: 'Indexing, ranking, crawling — core Google product domain' },
      { title: 'ML Model with Deployment', why: 'TensorFlow/JAX based project with real inference endpoint' },
      { title: 'Open Source Contribution', why: 'Demonstrates collaborative engineering at scale' },
      { title: 'Real-time Collaborative Tool', why: 'Google Docs-style — shows distributed systems + UX' },
    ],
    scorecard: ['Master LeetCode Medium/Hard (100+ problems)', 'Build 2–3 substantial engineering projects', '1-page resume with strong quantified bullets', 'Study OS, Networks, DBMS fundamentals', 'Practice behavioral with STAR method'],
  },

  microsoft: {
    resumeStrategy: {
      preferredLength: '1 page for interns, max 1.5 for experienced',
      preferredProjects: ['Cloud-based applications', 'Developer tools', 'Open-source projects', 'Projects using Azure or Microsoft tech'],
      keySkills: ['C#', '.NET', 'Azure', 'C++', 'Java', 'Python', 'SQL', 'OOP'],
      bulletExamples: [
        'Designed and shipped a REST API in ASP.NET Core serving 50K daily requests with 99.9% uptime.',
        'Reduced CI/CD pipeline time by 35% by parallelizing build steps in Azure DevOps.',
        'Built a desktop app using WPF that automated report generation, saving 3 hours/week per analyst.',
      ],
      commonMistakes: [
        'Not showing ownership — Microsoft values end-to-end project responsibility',
        'Missing OOP design elements in project descriptions',
        'Using buzzwords without substance (e.g., "utilized AI to improve performance")',
      ],
    },
    skills: {
      frontend:     { level: M, note: 'Relevant for product/tooling roles' },
      backend:      { level: H, note: 'APIs, services, cloud integration' },
      dsa:          { level: H, note: 'Core interview topic — LeetCode Medium level' },
      database:     { level: M, note: 'SQL Server / Azure SQL knowledge valued' },
      cloud:        { level: H, note: 'Azure knowledge is a strong differentiator' },
      devops:       { level: M, note: 'Azure DevOps, CI/CD pipelines' },
      systemDesign: { level: M, note: 'Expected in later interview stages' },
    },
    interviewFocus: ['DSA (Medium difficulty focus)', 'OOP Design Principles', 'CS Fundamentals', 'Coding (1–3 rounds)', 'Behavioral (growth mindset)'],
    hiringProcess: ['Online Application / Campus Drive', 'Resume Shortlisting', 'Online Assessment (Codility)', 'Technical Interviews (2–3 rounds)', 'HR / Cultural Fit Round', 'Offer'],
    projectIdeas: [
      { title: 'Azure-Hosted Web Application', why: 'Directly aligns with Microsoft Cloud strategy' },
      { title: 'Developer Productivity Tool', why: 'VS Code extensions, CLI tools — Microsoft culture' },
      { title: 'OOP-Heavy System (e.g., Library System, Parking Lot)', why: 'Demonstrates design principles clearly' },
      { title: 'Collaborative App with Real-time Sync', why: 'Teams/Office ecosystem mindset' },
    ],
    scorecard: ['Practice LeetCode Medium (50–80 problems)', 'Strong OOP design knowledge', 'Learn Azure basics (free tier available)', 'Understand SOLID principles', 'Prepare growth-mindset behavioral stories'],
  },

  amazon: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['E-commerce or marketplace systems', 'Scalable backend services', 'Data pipelines', 'AWS-deployed projects'],
      keySkills: ['Java', 'Python', 'AWS', 'Data Structures', 'OOP', 'Distributed Systems', 'SQL'],
      bulletExamples: [
        'Built a product recommendation engine using collaborative filtering, increasing click-through by 18%.',
        'Designed a microservice handling 10K requests/sec with horizontal scaling on AWS ECS.',
        'Automated inventory reconciliation pipeline using AWS Lambda, reducing manual effort by 80%.',
      ],
      commonMistakes: [
        'Not mapping achievements to Amazon Leadership Principles on resume',
        'Describing team contributions without specifying your individual impact',
        'Listing AWS services without showing how you used them in a project',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not a focus unless applying for frontend roles' },
      backend:      { level: H, note: 'Microservices, REST APIs, scalability' },
      dsa:          { level: H, note: 'Core hiring filter — strong DSA required' },
      database:     { level: H, note: 'DynamoDB, RDS — NoSQL and SQL both valued' },
      cloud:        { level: H, note: 'AWS is the platform — familiarity strongly valued' },
      devops:       { level: M, note: 'CI/CD, deployment pipelines' },
      systemDesign: { level: H, note: 'Scalability, fault tolerance are core topics' },
    },
    interviewFocus: ['DSA', 'Leadership Principles (LP-based behavioral)', 'System Design (scalability focus)', 'OOP', 'Problem Solving'],
    hiringProcess: ['Online Application / Campus Drive', 'Online Assessment (HackerTest — 2 DSA problems)', 'LP + Technical Interview Round 1', 'LP + Technical Interview Round 2', 'Bar Raiser Round', 'HR Offer'],
    projectIdeas: [
      { title: 'E-commerce Order Management System', why: 'Core Amazon domain — inventory, cart, payments' },
      { title: 'Scalable URL Shortener', why: 'Classic system design — shows distributed thinking' },
      { title: 'Recommendation Engine', why: "ML meets product — Amazon's core personalization tech" },
      { title: 'AWS Lambda Serverless Pipeline', why: 'Shows hands-on AWS and event-driven architecture' },
    ],
    scorecard: ['Know all 16 Leadership Principles with examples', 'Practice DSA on LeetCode (80+ problems)', 'Build an AWS-deployed project', 'Study system design (High scalability blog)', 'Prepare STAR stories for every LP'],
  },

  adobe: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Creative tools or media processing', 'Document workflows', 'AI/ML applied to visual data', 'Web or mobile apps with strong UI/UX'],
      keySkills: ['C++', 'Java', 'Python', 'React', 'TypeScript', 'Data Structures', 'Algorithms'],
      bulletExamples: [
        'Built a PDF annotation tool using React and Canvas API, supporting 10+ annotation types.',
        'Implemented image segmentation model using PyTorch achieving 87% mIoU on custom dataset.',
        'Reduced document rendering time by 25% by optimizing font caching in a C++ renderer.',
      ],
      commonMistakes: [
        'Ignoring UI/UX quality in project descriptions — Adobe values design awareness',
        'Listing DSA skills without strong project context',
        'Not demonstrating ownership of end-to-end product features',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'Strong UI and web skills valued across Adobe products' },
      backend:      { level: M, note: 'Varies by team — Creative Cloud vs Document Cloud' },
      dsa:          { level: H, note: 'Core technical screening area' },
      database:     { level: M, note: 'SQL knowledge expected' },
      cloud:        { level: M, note: 'AWS/Azure experience appreciated' },
      devops:       { level: L, note: 'Not a primary area for engineering interns' },
      systemDesign: { level: M, note: 'Discussed in senior technical rounds' },
    },
    interviewFocus: ['DSA (LeetCode Easy–Medium)', 'Project Deep-dive', 'CS Fundamentals (OS, DBMS)', 'Coding (1–2 rounds)', 'Behavioral/Cultural Fit'],
    hiringProcess: ['Campus / Online Application', 'Online Assessment', 'Technical Interview (DSA + Projects)', 'Technical Interview Round 2', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'PDF Viewer/Editor in Browser', why: "Adobe's core product domain — Document Cloud" },
      { title: 'Image Filter App (with AI)', why: 'Photoshop-adjacent — shows creativity + engineering' },
      { title: 'Creative Portfolio Builder', why: 'Aligns with Behance/Creative Cloud product thinking' },
      { title: 'Real-time Collaborative Canvas', why: 'Emerging in Adobe Express and Frame.io' },
    ],
    scorecard: ['Practice DSA (LeetCode Easy–Medium)', 'Build visually polished side projects', 'Know OS and DBMS concepts', 'Prepare project walkthrough (deep technical detail)', "Research Adobe's product portfolio"],
  },

  flipkart: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['E-commerce or marketplace features', 'High-traffic backend services', 'Search and recommendation systems', 'Mobile apps'],
      keySkills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Data Structures', 'Algorithms', 'System Design'],
      bulletExamples: [
        'Built product search feature with Elasticsearch supporting 50K queries/sec.',
        'Reduced cart-checkout latency by 30% using Redis caching and optimized DB queries.',
        'Developed REST API for order tracking, integrated with 3 internal microservices.',
      ],
      commonMistakes: [
        'Not highlighting scale or traffic numbers in project descriptions',
        'Weak data structure knowledge evidenced by poor OA performance',
        'Generic project descriptions that don\'t show real engineering decisions',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Primarily backend-focused engineering roles' },
      backend:      { level: H, note: 'Java/Spring ecosystem is dominant here' },
      dsa:          { level: H, note: 'Strict DSA filter in OA rounds' },
      database:     { level: H, note: 'MySQL, Redis — high-scale DB usage' },
      cloud:        { level: M, note: 'AWS/Azure knowledge useful' },
      devops:       { level: L, note: 'Not primary for interns' },
      systemDesign: { level: H, note: 'Design for millions of users is core' },
    },
    interviewFocus: ['DSA (Medium–Hard)', 'System Design (e-commerce scale)', 'Java/OOP', 'SQL & Databases', 'Problem Solving'],
    hiringProcess: ['Campus Drive / Online Application', 'Online Assessment (2–3 DSA problems)', 'Technical Round 1 (DSA)', 'Technical Round 2 (System Design + Projects)', 'HR Round'],
    projectIdeas: [
      { title: 'Product Catalog & Cart System', why: 'Core e-commerce domain — directly applicable' },
      { title: 'Logistics Tracking System', why: 'Flipkart Logistics is a major product area' },
      { title: 'Flash Sale System (concurrent users)', why: 'Shows concurrency and race condition handling' },
      { title: 'Search with Filters (Elasticsearch)', why: 'Flipkart search is a major engineering challenge' },
    ],
    scorecard: ['Practice DSA (LeetCode Medium/Hard)', 'Strong Java and Spring Boot project', 'Know database indexing and query optimization', 'Study system design at e-commerce scale', 'Prepare for high-concurrency scenarios'],
  },

  cisco: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Networking tools', 'Security projects', 'Cloud orchestration', 'Protocol implementations'],
      keySkills: ['Python', 'C', 'C++', 'Networking (TCP/IP, BGP)', 'YAML/JSON', 'Linux', 'REST APIs'],
      bulletExamples: [
        'Implemented BGP route aggregation in Python reducing routing table size by 22%.',
        'Built a network topology visualizer using React + D3.js and Cisco DevNet APIs.',
        'Automated network device configuration using Ansible playbooks, reducing setup time by 60%.',
      ],
      commonMistakes: [
        'No networking concepts knowledge — this is non-negotiable for Cisco roles',
        'Ignoring Linux/CLI familiarity',
        'Over-emphasizing web development skills for core engineering roles',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Relevant for dashboard/UI roles only' },
      backend:      { level: M, note: 'REST APIs, automation scripts' },
      dsa:          { level: M, note: 'Standard OA but not extreme difficulty' },
      database:     { level: L, note: 'Basic SQL sufficient' },
      cloud:        { level: M, note: 'Cisco+ Cloud, AWS integration awareness' },
      devops:       { level: H, note: 'Automation, NetDevOps, Ansible, Terraform' },
      systemDesign: { level: M, note: 'Network architecture concepts valued' },
    },
    interviewFocus: ['Networking Fundamentals (OSI, TCP/IP)', 'DSA (standard difficulty)', 'Python/C/C++ Coding', 'System/Network Design', 'Behavioral'],
    hiringProcess: ['Campus Recruitment / Online Application', 'Online Assessment', 'Technical Interview (Networking + DSA)', 'Technical Interview Round 2', 'HR Round'],
    projectIdeas: [
      { title: 'Network Packet Analyzer', why: 'Core networking domain — Wireshark-like tool' },
      { title: 'SDN Controller (mini)', why: 'Software-defined networking is Cisco\'s future' },
      { title: 'Network Topology Visualizer', why: 'Uses Cisco DevNet APIs — great for portfolio' },
      { title: 'Automated Network Config Tool', why: 'NetDevOps — Ansible, Python, YANG/NETCONF' },
    ],
    scorecard: ['Learn TCP/IP and OSI model deeply', 'Practice Python networking (socket programming)', 'Build a network automation project', 'Practice DSA (standard level)', 'Get Cisco DevNet Associate certification (optional but valuable)'],
  },

  razorpay: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Payment/fintech systems', 'API-first backends', 'Dashboard analytics apps', 'High-reliability services'],
      keySkills: ['Golang', 'Node.js', 'Python', 'MySQL', 'Redis', 'Kafka', 'REST APIs', 'Data Structures'],
      bulletExamples: [
        'Built a payment reconciliation service processing 100K transactions/day with < 0.001% error rate.',
        'Designed idempotent API endpoints for payment retry logic, reducing duplicate transactions by 99%.',
        'Implemented webhook delivery system with exponential retry using Redis queues.',
      ],
      commonMistakes: [
        'Not demonstrating understanding of reliability and consistency in distributed systems',
        'Missing API design experience — Razorpay is API-first',
        'Weak backend fundamentals for a company built on backend engineering',
      ],
    },
    skills: {
      frontend:     { level: M, note: 'Dashboard and merchant portal roles' },
      backend:      { level: H, note: 'Core domain — Golang, Node.js strongly preferred' },
      dsa:          { level: H, note: 'Strong OA filter, DSA important' },
      database:     { level: H, note: 'MySQL, Redis — transactional correctness critical' },
      cloud:        { level: M, note: 'AWS deployment experience useful' },
      devops:       { level: M, note: 'Kubernetes, Docker awareness useful' },
      systemDesign: { level: H, note: 'Payment systems require reliability by design' },
    },
    interviewFocus: ['DSA', 'System Design (payment/fintech)', 'API Design', 'Database & Transactions', 'Backend deep-dive', 'Problem Solving'],
    hiringProcess: ['Online Application', 'Online Assessment (DSA)', 'Technical Interview (DSA + Projects)', 'System Design / Backend Round', 'Culture Fit Round', 'Offer'],
    projectIdeas: [
      { title: 'Payment Gateway Clone', why: 'Direct domain — shows you understand the problem space' },
      { title: 'Idempotent REST API', why: 'Core Razorpay engineering challenge' },
      { title: 'Merchant Analytics Dashboard', why: 'Real-time financial reporting — Razorpay product' },
      { title: 'Webhook Delivery System', why: 'Reliability and retry logic — exactly what Razorpay builds' },
    ],
    scorecard: ['Understand distributed transactions (ACID, 2PC)', 'Build an API-first backend project', 'Learn idempotency and retry patterns', 'Practice DSA (LeetCode Medium)', 'Study Razorpay API documentation'],
  },

  nvidia: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['CUDA/GPU programming', 'Deep learning model training', 'High-performance computing', 'Computer vision projects'],
      keySkills: ['CUDA', 'C++', 'Python', 'PyTorch', 'TensorFlow', 'Deep Learning', 'Parallel Computing'],
      bulletExamples: [
        'Optimized CUDA kernel for matrix multiplication achieving 3× speedup over naive implementation.',
        'Trained YOLOv8 model for custom object detection, achieving 91.3% mAP on benchmark dataset.',
        'Reduced ResNet-50 inference time by 40% using TensorRT optimization and INT8 quantization.',
      ],
      commonMistakes: [
        'No GPU programming or parallel computing knowledge for GPU architecture roles',
        'Theoretical ML knowledge without hands-on model training experience',
        'Missing performance benchmarking numbers in project descriptions',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant for engineering roles' },
      backend:      { level: M, note: 'Inference serving, API wrappers' },
      dsa:          { level: M, note: 'Standard DSA expected, not extreme' },
      database:     { level: L, note: 'Not a focus area' },
      cloud:        { level: M, note: 'AWS/GCP for model deployment' },
      devops:       { level: L, note: 'Not primary for interns' },
      systemDesign: { level: M, note: 'ML systems design for senior roles' },
    },
    interviewFocus: ['C++/CUDA Programming', 'Deep Learning (PyTorch/TF)', 'Computer Architecture', 'GPU Optimization', 'DSA (standard)'],
    hiringProcess: ['Online Application', 'Technical Phone Screen', 'Technical Interview (C++/DL specific)', 'Technical Interview Round 2', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'CUDA Parallel Sorting Algorithm', why: 'Core GPU programming demonstration' },
      { title: 'Object Detection with TensorRT Optimization', why: 'NVIDIA\'s core ML deployment stack' },
      { title: 'Neural Style Transfer App', why: 'Creative + CV + GPU — strong portfolio piece' },
      { title: 'Custom CUDA Matrix Library', why: 'Shows parallel computing mastery' },
    ],
    scorecard: ['Learn CUDA programming basics', 'Train and optimize at least one DL model', 'Know GPU architecture (warps, SMs, memory hierarchy)', 'Practice C++ performance optimization', 'Benchmark all projects with before/after metrics'],
  },

  atlassian: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Developer tools or SaaS products', 'Collaboration features', 'Cloud-native services', 'Open-source tooling'],
      keySkills: ['Java', 'Python', 'React', 'TypeScript', 'REST APIs', 'PostgreSQL', 'AWS', 'Jira API'],
      bulletExamples: [
        'Built a Jira plugin automating sprint retrospective reports, used by 200+ teams internally.',
        'Developed a real-time collaborative notes feature using WebSockets and React, reducing sync lag by 90%.',
        'Migrated monolithic service to microservices on AWS ECS, improving deployment frequency by 4×.',
      ],
      commonMistakes: [
        'Not showing understanding of collaboration tools and developer workflows',
        'Missing cloud-native project experience',
        'No mention of API integration or platform extensibility',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'React/TypeScript — Jira, Confluence UI' },
      backend:      { level: H, note: 'Java, Python — cloud platform services' },
      dsa:          { level: M, note: 'Moderate difficulty expected' },
      database:     { level: M, note: 'PostgreSQL, relational DB design' },
      cloud:        { level: H, note: 'AWS is primary cloud — strong differentiator' },
      devops:       { level: M, note: 'CI/CD, Bitbucket Pipelines familiarity' },
      systemDesign: { level: M, note: 'Collaboration system design patterns' },
    },
    interviewFocus: ['Coding (LeetCode Medium)', 'System Design', 'API & Platform Design', 'Behavioral (Open Company values)', 'Project Deep-dive'],
    hiringProcess: ['Online Application', 'Online Assessment', 'Technical Phone Screen', 'Virtual Technical Interviews (2 rounds)', 'Values Interview', 'Offer'],
    projectIdeas: [
      { title: 'Jira/Trello-like Project Board', why: 'Core Atlassian product — task management, drag-drop' },
      { title: 'Real-time Collaborative Text Editor', why: 'Confluence/Notion-style — shows CRDT or OT knowledge' },
      { title: 'CI/CD Pipeline Visualizer', why: 'Bitbucket Pipelines domain — DevOps tooling' },
      { title: 'Slack/Teams Integration Bot', why: 'Atlassian integrations ecosystem' },
    ],
    scorecard: ['Practice coding (LeetCode Medium)', 'Build a SaaS/collaboration tool project', 'Learn AWS basics', 'Understand Atlassian\'s product suite (Jira, Confluence, Bitbucket)', 'Prepare values-based behavioral answers'],
  },

  linkedin: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Social graph features', 'Recommendation engines', 'Search ranking systems', 'Data pipelines at scale'],
      keySkills: ['Java', 'Python', 'Kafka', 'Spark', 'Distributed Systems', 'ML/Recommendations', 'REST APIs'],
      bulletExamples: [
        'Built a feed ranking model using gradient boosting, improving engagement rate by 12%.',
        'Designed a Kafka-based event pipeline processing 1M+ events/day with < 100ms p99 latency.',
        'Implemented graph traversal for 2nd-degree connection recommendations using BFS on 50M nodes.',
      ],
      commonMistakes: [
        'No data or ML project experience for a company heavily reliant on algorithms',
        'Ignoring distributed systems concepts',
        'Not demonstrating understanding of social product thinking',
      ],
    },
    skills: {
      frontend:     { level: M, note: 'React/JS for product engineering roles' },
      backend:      { level: H, note: 'Java, distributed services, Kafka' },
      dsa:          { level: H, note: 'Strong DSA required — especially graphs' },
      database:     { level: H, note: 'Distributed DBs, Espresso (custom DB), SQL' },
      cloud:        { level: M, note: 'Azure (Microsoft ecosystem)' },
      devops:       { level: L, note: 'Not primary for interns' },
      systemDesign: { level: H, note: 'Social network scale design problems' },
    },
    interviewFocus: ['DSA (Graphs, DP, Trees)', 'System Design (social scale)', 'Distributed Systems', 'Behavioral', 'ML/Data pipeline design'],
    hiringProcess: ['Online Application / Campus', 'Resume Screen', 'Technical Phone Interview', 'Virtual On-site (3–4 rounds: DSA + Design + Behavioral)', 'Offer'],
    projectIdeas: [
      { title: 'Social Network Graph App', why: 'Connections, followers, recommendations — core LinkedIn' },
      { title: 'Feed Ranking Algorithm', why: 'Personalization is central to LinkedIn\'s product' },
      { title: 'Real-time Notification System', why: 'Kafka-based pub-sub — scales to millions of users' },
      { title: 'Job Recommendation Engine', why: 'Direct LinkedIn product domain — ML + search' },
    ],
    scorecard: ['Master graph algorithms (BFS, DFS, Dijkstra)', 'Build a data pipeline project', 'Study distributed systems (Kafka, Zookeeper)', 'Practice system design for social networks', 'Know LinkedIn\'s engineering blog (engineering.linkedin.com)'],
  },

  salesforce: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['CRM features', 'Enterprise SaaS tools', 'Data analytics dashboards', 'API integrations'],
      keySkills: ['Java', 'Apex', 'Lightning Web Components', 'REST APIs', 'SQL', 'Python', 'Salesforce platform'],
      bulletExamples: [
        'Built a Salesforce Apex trigger automating lead scoring, reducing manual review by 40%.',
        'Developed a Lightning Web Component dashboard visualizing sales pipeline in real-time.',
        'Created REST API integration connecting Salesforce CRM with external ERP system.',
      ],
      commonMistakes: [
        'No knowledge of Salesforce platform basics (Apex, SOQL) for Salesforce-specific roles',
        'Generic projects with no enterprise/B2B relevance',
        'Missing API integration experience',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'Lightning Web Components — essential for product teams' },
      backend:      { level: H, note: 'Java, Apex, microservices on Hyperforce' },
      dsa:          { level: M, note: 'OA required, medium difficulty' },
      database:     { level: H, note: 'SOQL, SQL, relational data modeling' },
      cloud:        { level: H, note: 'Salesforce Hyperforce (AWS-based), multi-cloud' },
      devops:       { level: M, note: 'Salesforce DevOps Center, CI/CD pipelines' },
      systemDesign: { level: M, note: 'Enterprise system integration design' },
    },
    interviewFocus: ['DSA (Medium level)', 'OOP & Design Patterns', 'Salesforce Platform Knowledge (for platform roles)', 'Behavioral (Trailhead values)', 'System/API Design'],
    hiringProcess: ['Online Application / Futureforce Program', 'Online Assessment', 'Technical Interview (DSA + OOP)', 'Technical Interview (Platform/Domain)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'CRM Dashboard (Salesforce or custom)', why: 'Core product domain — pipeline tracking, analytics' },
      { title: 'Salesforce Apex/LWC Mini App', why: 'Shows Salesforce platform proficiency' },
      { title: 'API Integration (CRM + ERP)', why: 'Enterprise integration is core Salesforce use case' },
      { title: 'Data Visualization Dashboard', why: 'Tableau-style analytics — Salesforce owns Tableau' },
    ],
    scorecard: ['Complete Salesforce Trailhead modules (free)', 'Practice DSA (Medium level)', 'Build a CRM-related project', 'Know OOP design patterns', 'Research Salesforce product portfolio'],
  },

  uber: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Real-time systems', 'Maps and geolocation', 'Distributed backend services', 'ML for pricing/dispatch'],
      keySkills: ['Go', 'Python', 'Java', 'Kafka', 'gRPC', 'Distributed Systems', 'Data Structures', 'SQL'],
      bulletExamples: [
        'Built real-time ride-matching simulation in Python, processing 500 concurrent requests with < 50ms latency.',
        'Designed Kafka-based event streaming pipeline for location updates from 10K concurrent drivers.',
        'Optimized geospatial query using PostGIS index, reducing map search time by 60%.',
      ],
      commonMistakes: [
        'No experience with real-time or event-driven systems',
        'Weak system design for high-concurrency scenarios',
        'Not quantifying performance metrics in project descriptions',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'App UI handled by dedicated mobile teams' },
      backend:      { level: H, note: 'Go, Python, distributed services at massive scale' },
      dsa:          { level: H, note: 'Strong DSA required for OA and technical rounds' },
      database:     { level: H, note: 'PostgreSQL, Redis, Cassandra — multi-model at Uber' },
      cloud:        { level: M, note: 'AWS deployment, multi-cloud awareness' },
      devops:       { level: M, note: 'Kubernetes, containerized services' },
      systemDesign: { level: H, note: 'Real-time dispatch, pricing, mapping design problems' },
    },
    interviewFocus: ['DSA (Hard)', 'Real-time System Design', 'Distributed Systems', 'Problem Solving', 'Behavioral'],
    hiringProcess: ['Online Application', 'Online Assessment (DSA)', 'Technical Interview (2 rounds: DSA + System Design)', 'Behavioral Round', 'Offer'],
    projectIdeas: [
      { title: 'Ride-Sharing Simulation', why: 'Driver-rider matching — core Uber engineering problem' },
      { title: 'Real-time Location Tracker', why: 'WebSockets + maps — Uber\'s core product feature' },
      { title: 'Dynamic Pricing Engine', why: 'Surge pricing — supply/demand calculation system' },
      { title: 'ETA Prediction System', why: 'ML + maps — Uber\'s key user-facing product challenge' },
    ],
    scorecard: ['Master real-time architecture patterns', 'Practice hard DSA (LeetCode Hard)', 'Build a project with WebSockets or Kafka', 'Study geospatial algorithms', 'Research Uber Engineering blog'],
  },

  intuit: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Financial tools or calculators', 'Tax computation apps', 'AI-assisted user products', 'Data analytics dashboards'],
      keySkills: ['Java', 'Python', 'React', 'AWS', 'ML/AI', 'SQL', 'REST APIs'],
      bulletExamples: [
        'Built a personal finance tracker with category prediction using NLP, achieving 89% classification accuracy.',
        'Developed tax deduction recommendation tool in React, reducing form completion time by 25%.',
        'Designed AWS Lambda pipeline processing financial statements into structured JSON for downstream analysis.',
      ],
      commonMistakes: [
        'No financial domain awareness — Intuit is a fintech company at its core',
        'Missing AI/ML project experience for a company investing heavily in generative AI',
        'Generic CRUD apps with no product thinking',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'React — TurboTax, QuickBooks UI are customer-facing' },
      backend:      { level: H, note: 'Java, Python, microservices on AWS' },
      dsa:          { level: M, note: 'Standard OA, medium difficulty' },
      database:     { level: M, note: 'SQL, data modeling for financial records' },
      cloud:        { level: H, note: 'AWS-first company — strong preference' },
      devops:       { level: M, note: 'CI/CD, deployment pipelines on AWS' },
      systemDesign: { level: M, note: 'Scalable financial system design' },
    },
    interviewFocus: ['DSA (Medium)', 'AI/ML Concepts', 'React/Full Stack', 'Behavioral (Customer-Obsession)', 'System Design'],
    hiringProcess: ['Online Application / CraftForce Campus Program', 'Online Assessment', 'Technical Interview (DSA + Project)', 'Technical Interview (Product/ML focus)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Personal Finance Tracker with AI', why: 'TurboTax/Mint adjacent — Intuit\'s core product' },
      { title: 'Tax Deduction Finder App', why: 'Direct product relevance — shows domain understanding' },
      { title: 'Expense Categorization with NLP', why: 'QuickBooks uses ML — shows applied AI skills' },
      { title: 'Budget Planning Dashboard', why: 'Mint-style product — financial UX + data viz' },
    ],
    scorecard: ['Build at least one financial AI project', 'Practice React with real data', 'Learn AWS (free tier)', 'Practice DSA (Medium level)', 'Research Intuit\'s AI strategy (GenOS)'],
  },

  servicenow: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Workflow automation tools', 'Enterprise IT service apps', 'AI-powered classification systems', 'Dashboard and reporting tools'],
      keySkills: ['JavaScript', 'Java', 'ServiceNow platform (optional)', 'REST APIs', 'Python', 'SQL', 'Cloud'],
      bulletExamples: [
        'Built a ticket classification system using BERT, reducing manual triage time by 50%.',
        'Developed workflow automation reducing IT request resolution time from 5 days to 2 days.',
        'Created REST API integration connecting ITSM tool with Slack for real-time incident alerts.',
      ],
      commonMistakes: [
        'Not understanding what ITSM/workflow automation means in enterprise context',
        'Generic projects without enterprise use-case framing',
        'Missing integration experience (REST APIs between systems)',
      ],
    },
    skills: {
      frontend:     { level: M, note: 'ServiceNow UI, Angular/React for portal development' },
      backend:      { level: H, note: 'Java, JavaScript — core platform development' },
      dsa:          { level: M, note: 'Standard difficulty OA' },
      database:     { level: M, note: 'SQL, relational schema design' },
      cloud:        { level: H, note: 'AWS/Azure deployment, multi-cloud aware' },
      devops:       { level: M, note: 'CI/CD automation — core product theme' },
      systemDesign: { level: M, note: 'Workflow engine design, event-driven architecture' },
    },
    interviewFocus: ['DSA (Medium)', 'REST API Design', 'System Design (workflow/automation)', 'OOP', 'Behavioral'],
    hiringProcess: ['Online Application / Campus', 'Online Assessment', 'Technical Interview (DSA + API)', 'Technical Interview (Domain/Design)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'IT Helpdesk Ticket System', why: 'ServiceNow\'s primary product — ITSM ticketing' },
      { title: 'Automated Approval Workflow', why: 'Core platform feature — shows workflow engine understanding' },
      { title: 'Incident Alert Bot (Slack/Teams)', why: 'Integration use case — real enterprise pattern' },
      { title: 'AI Ticket Classifier', why: 'ML + ITSM — directly applicable to ServiceNow AI features' },
    ],
    scorecard: ['Understand ITSM fundamentals', 'Build a workflow automation project', 'Learn REST API design patterns', 'Practice DSA (Medium)', 'Explore ServiceNow developer resources (developer.servicenow.com)'],
  },

  swiggy: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Food/logistics delivery systems', 'Real-time tracking', 'Recommendation engines', 'High-throughput backend services'],
      keySkills: ['Java', 'Spring Boot', 'Python', 'Redis', 'Kafka', 'MySQL', 'Docker', 'Data Structures'],
      bulletExamples: [
        'Built a delivery ETA prediction model with 85% accuracy using historical order + traffic data.',
        'Designed restaurant search API with Redis caching, reducing P99 latency from 800ms to 120ms.',
        'Implemented real-time order status tracking using WebSockets serving 5K concurrent connections.',
      ],
      commonMistakes: [
        'No experience with high-concurrency backend systems',
        'Generic projects without real-time or event-driven components',
        'Weak understanding of caching and database optimization',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Mobile-first app — separate teams handle this' },
      backend:      { level: H, note: 'Java, Python, microservices at order scale' },
      dsa:          { level: H, note: 'Strong DSA filter in OA rounds' },
      database:     { level: H, note: 'MySQL, Redis — high-frequency read/write workloads' },
      cloud:        { level: M, note: 'AWS deployment experience useful' },
      devops:       { level: M, note: 'Docker, Kubernetes basics' },
      systemDesign: { level: H, note: 'Food delivery scale — routing, matching, ETA' },
    },
    interviewFocus: ['DSA (Medium–Hard)', 'System Design (delivery platform)', 'Backend Architecture', 'SQL & Caching', 'Problem Solving'],
    hiringProcess: ['Online Application', 'Online Assessment (DSA)', 'Technical Interview (DSA + Backend)', 'System Design Round', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Food Delivery App Backend', why: 'Direct domain match — menu, orders, delivery tracking' },
      { title: 'Real-time Order Tracker', why: 'WebSockets + maps — core Swiggy product' },
      { title: 'Restaurant Recommendation Engine', why: 'Personalization — ML applied to food ordering' },
      { title: 'Delivery Route Optimizer', why: 'Geospatial + graph algorithms — Swiggy logistics' },
    ],
    scorecard: ['Practice LeetCode Medium/Hard', 'Build a real-time backend project', 'Know Redis caching patterns', 'Study delivery platform architecture', 'Learn Kafka or RabbitMQ basics'],
  },

  zomato: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Food-tech or hyperlocal delivery', 'Data analytics products', 'Recommendation systems', 'Backend APIs at scale'],
      keySkills: ['Python', 'Go', 'React', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Data Structures'],
      bulletExamples: [
        'Built restaurant discovery feature with geo-search using PostGIS, returning results in < 50ms.',
        'Developed review sentiment analysis model with 82% accuracy, used to surface high-quality reviews.',
        'Implemented loyalty points system with concurrent transaction handling for 100K daily users.',
      ],
      commonMistakes: [
        'No geospatial or location-aware project experience',
        'Weak data analytics or ML project portfolio for a data-driven company',
        'No understanding of concurrency in transaction systems',
      ],
    },
    skills: {
      frontend:     { level: M, note: 'React — consumer app and merchant dashboard' },
      backend:      { level: H, note: 'Python, Go — hyperlocal services at scale' },
      dsa:          { level: H, note: 'OA filter with medium–hard problems' },
      database:     { level: H, note: 'MySQL, MongoDB, Redis — multi-model usage' },
      cloud:        { level: M, note: 'AWS/GCP deployment' },
      devops:       { level: M, note: 'Docker, microservices deployment' },
      systemDesign: { level: H, note: 'Hyperlocal platform — geo-routing, matching, pricing' },
    },
    interviewFocus: ['DSA (Medium)', 'System Design (hyperlocal scale)', 'Backend + DB Deep-dive', 'Analytics Thinking', 'Problem Solving'],
    hiringProcess: ['Online Application', 'Online Assessment', 'Technical Interview (DSA)', 'System Design + Backend Round', 'Culture Round', 'Offer'],
    projectIdeas: [
      { title: 'Restaurant Discovery App', why: 'Core Zomato product — geo-search, filters, reviews' },
      { title: 'Review Sentiment Analyzer', why: 'ML + NLP — Zomato has 100M+ reviews to analyze' },
      { title: 'Food Delivery Backend', why: 'Orders, tracking, restaurant management API' },
      { title: 'Hyperlocal Search System', why: 'Geospatial search — Zomato\'s core technical challenge' },
    ],
    scorecard: ['Practice DSA (LeetCode Medium)', 'Build a geo-aware backend project', 'Learn database optimization', 'Study Zomato tech blog (engineering.zomato.com)', 'Prepare system design for hyperlocal apps'],
  },

  meesho: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Social commerce features', 'Catalog management systems', 'Seller tools', 'Vernacular or multilingual apps'],
      keySkills: ['React', 'Node.js', 'Python', 'MySQL', 'Redis', 'Kafka', 'Data Structures'],
      bulletExamples: [
        'Built product catalog ingestion pipeline processing 50K SKUs/day with automated quality validation.',
        'Developed seller onboarding flow in React Native, reducing signup completion time by 30%.',
        'Designed A/B testing framework for product listing images, improving conversion by 12%.',
      ],
      commonMistakes: [
        'No e-commerce or catalog management project experience',
        'Ignoring mobile-first design in project work',
        'No growth/product metrics in project descriptions',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'React/React Native — mobile-first consumer product' },
      backend:      { level: H, note: 'Node.js, Python — catalog, orders, payments' },
      dsa:          { level: H, note: 'Strong DSA filter in hiring' },
      database:     { level: M, note: 'MySQL, Redis — standard stack' },
      cloud:        { level: M, note: 'AWS deployment knowledge useful' },
      devops:       { level: L, note: 'Not primary for interns' },
      systemDesign: { level: M, note: 'Social commerce at Tier 2/3 India scale' },
    },
    interviewFocus: ['DSA (Medium)', 'Full Stack / Frontend', 'Product Thinking', 'System Design (e-commerce)', 'Behavioral'],
    hiringProcess: ['Campus / Online Application', 'Online Assessment', 'Technical Interview (DSA + Full Stack)', 'Product/Design Round', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Social Commerce Platform', why: 'Share-to-buy mechanics — direct Meesho domain' },
      { title: 'Seller Dashboard App', why: 'Supplier management — Meesho\'s B2B2C model' },
      { title: 'Product Catalog with Image Search', why: 'Visual search — growing in social commerce' },
      { title: 'Reseller Referral System', why: 'Meesho\'s growth engine — network effect tracking' },
    ],
    scorecard: ['Practice DSA (Medium level)', 'Build a mobile-first React Native project', 'Understand social commerce model', 'Learn catalog management systems', 'Research Meesho\'s Tier 2/3 India approach'],
  },

  phonepe: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['UPI/payments systems', 'Financial infrastructure', 'High-reliability backend services', 'Fraud detection'],
      keySkills: ['Java', 'Kotlin', 'Microservices', 'MySQL', 'Redis', 'Kafka', 'Data Structures'],
      bulletExamples: [
        'Built UPI transaction simulation with rollback support for 10K concurrent test transactions.',
        'Designed fraud detection classifier achieving 94% precision with < 10ms inference latency.',
        'Implemented idempotent payment API reducing duplicate transactions by 99.8% under retries.',
      ],
      commonMistakes: [
        'No understanding of financial transaction reliability (ACID, idempotency)',
        'Projects with no concurrency handling',
        'Missing knowledge of UPI or payment ecosystem basics',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'App UI handled separately' },
      backend:      { level: H, note: 'Java, Kotlin microservices at payments scale' },
      dsa:          { level: H, note: 'Strong DSA required for OA' },
      database:     { level: H, note: 'MySQL, Redis — transactional correctness critical' },
      cloud:        { level: M, note: 'AWS deployment experience useful' },
      devops:       { level: M, note: 'Kubernetes, container orchestration' },
      systemDesign: { level: H, note: 'Payment system reliability, consistency, fraud detection' },
    },
    interviewFocus: ['DSA (Medium–Hard)', 'System Design (payments/fintech)', 'Java/Backend Deep-dive', 'Distributed Systems', 'Problem Solving'],
    hiringProcess: ['Online Application / Campus', 'Online Assessment', 'Technical Interview (DSA)', 'System Design + Backend Round', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'UPI Payment Flow Simulation', why: 'PhonePe\'s core product — shows payment domain awareness' },
      { title: 'Fraud Detection System', why: 'ML + rules-based — critical for fintech' },
      { title: 'Transaction Ledger System', why: 'Accounting correctness — double-entry bookkeeping in code' },
      { title: 'Wallet Management API', why: 'Idempotent, consistent, high-reliability backend' },
    ],
    scorecard: ['Understand UPI protocol basics', 'Build an idempotent payment API', 'Practice DSA (Hard level)', 'Study distributed transactions', 'Know fraud detection algorithms'],
  },

  deshaw: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Systems programming', 'Algorithm-intensive tools', 'Quantitative finance simulators', 'High-performance computing'],
      keySkills: ['C++', 'Python', 'Algorithms (Advanced)', 'Data Structures', 'Operating Systems', 'Linux', 'Mathematics'],
      bulletExamples: [
        'Implemented lock-free queue in C++ achieving 10× throughput improvement over mutex-based version.',
        'Built algorithmic trading simulator in Python with backtesting framework for 5 years of market data.',
        'Optimized memory-bound algorithm reducing cache misses by 35% using cache-oblivious data structure.',
      ],
      commonMistakes: [
        'Generic web/CRUD projects — DE Shaw values systems and algorithmic depth',
        'No competitive programming background',
        'Missing mathematics or quantitative thinking in project descriptions',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant for engineering roles at DE Shaw' },
      backend:      { level: H, note: 'Systems programming, C++, performance-critical services' },
      dsa:          { level: H, note: 'Extremely strong DSA required — competitive programming level' },
      database:     { level: M, note: 'Timeseries and financial data handling' },
      cloud:        { level: L, note: 'Mostly on-prem or proprietary infrastructure' },
      devops:       { level: L, note: 'Not a primary focus' },
      systemDesign: { level: H, note: 'Low-latency system design for trading platforms' },
    },
    interviewFocus: ['Advanced DSA (competitive programming level)', 'C++ Proficiency', 'Operating Systems (threads, memory, IPC)', 'Mathematics & Algorithms', 'Problem Solving Speed'],
    hiringProcess: ['Campus Drive', 'Online Assessment (advanced DSA)', 'Technical Interview Round 1 (advanced DSA)', 'Technical Interview Round 2 (systems + puzzles)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Lock-free Data Structures in C++', why: 'Low-latency systems — DE Shaw\'s core need' },
      { title: 'Algorithmic Trading Backtester', why: 'Quantitative finance simulation — firm domain' },
      { title: 'High-performance Sorting Benchmark', why: 'Shows C++ optimization and systems thinking' },
      { title: 'Custom Memory Allocator', why: 'Systems programming mastery — respected at DE Shaw' },
    ],
    scorecard: ['Solve 200+ LeetCode problems (including Hard)', 'Practice competitive programming (Codeforces, ICPC)', 'Master C++ (templates, STL internals, memory model)', 'Study OS deeply (OSTEP book)', 'Know probability and discrete mathematics'],
  },

  groww: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Investment platforms', 'Financial dashboards', 'Data visualization apps', 'Mobile-first fintech products'],
      keySkills: ['React', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'Redis', 'Data Structures'],
      bulletExamples: [
        'Built stock portfolio tracker with real-time price updates via WebSocket, supporting 10K concurrent users.',
        'Designed mutual fund comparison tool with historical NAV charts using Recharts, improving user session time by 20%.',
        'Implemented idempotent order placement API with distributed lock for mutual fund transactions.',
      ],
      commonMistakes: [
        'No financial domain knowledge in project descriptions',
        'Missing real-time data handling in frontend projects',
        'Generic CRUD apps with no product differentiation',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'React — Groww is heavily consumer-facing web + app' },
      backend:      { level: H, note: 'Node.js, Python — fintech APIs and services' },
      dsa:          { level: H, note: 'Strong DSA required for OA' },
      database:     { level: M, note: 'PostgreSQL, Redis for portfolio and transaction data' },
      cloud:        { level: M, note: 'AWS — primary cloud for Groww' },
      devops:       { level: L, note: 'Not primary for interns' },
      systemDesign: { level: M, note: 'Investment platform design at retail scale' },
    },
    interviewFocus: ['DSA (Medium)', 'Full Stack (React + Node)', 'System Design (fintech)', 'Product Thinking', 'Behavioral'],
    hiringProcess: ['Online Application', 'Online Assessment', 'Technical Interview (DSA + Full Stack)', 'System Design Round', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Stock Portfolio Tracker', why: 'Direct Groww product domain — investments + charts' },
      { title: 'Mutual Fund Comparison Tool', why: 'Core Groww feature — NAV tracking, returns' },
      { title: 'SIP Calculator with Visualization', why: 'Financial planning UX — Groww product thinking' },
      { title: 'Real-time Market Dashboard', why: 'WebSocket + financial data — live price feeds' },
    ],
    scorecard: ['Build a fintech React project', 'Practice DSA (Medium)', 'Understand mutual funds and SIPs basics', 'Learn WebSocket for real-time data', 'Research Groww\'s product and engineering blog'],
  },

  postman: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['API testing tools', 'Developer productivity tools', 'CLI tools', 'Open-source contributions'],
      keySkills: ['JavaScript', 'Node.js', 'REST APIs', 'GraphQL', 'gRPC', 'React', 'Testing'],
      bulletExamples: [
        'Built VS Code extension for API testing with syntax highlighting and request history, 500+ installs.',
        'Created automated API regression testing framework in Node.js, reducing testing time by 60%.',
        'Developed GraphQL playground clone with schema introspection and query autocomplete.',
      ],
      commonMistakes: [
        'Not demonstrating API or developer tooling project experience',
        'No contribution to or awareness of the developer community',
        'Weak JavaScript/Node.js fundamentals for a JS-first company',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'React/Electron — Postman is a desktop+web app' },
      backend:      { level: H, note: 'Node.js — API server, mock servers, testing engines' },
      dsa:          { level: M, note: 'Standard difficulty OA' },
      database:     { level: M, note: 'Data storage for collections, environments' },
      cloud:        { level: M, note: 'Postman Cloud features — sync, sharing' },
      devops:       { level: M, note: 'API CI/CD — core Postman use case' },
      systemDesign: { level: M, note: 'API platform design, collaboration features' },
    },
    interviewFocus: ['API Design & REST Principles', 'JavaScript/Node.js', 'DSA (Medium)', 'Developer Tooling Thinking', 'Behavioral'],
    hiringProcess: ['Online Application', 'Online Assessment', 'Technical Interview (JS + API)', 'Take-home Project (often)', 'Culture Fit Round', 'Offer'],
    projectIdeas: [
      { title: 'API Testing Tool (Postman-like)', why: 'Direct product domain — shows you understand the problem' },
      { title: 'Mock API Server', why: 'Postman\'s mock server is a key feature — shows understanding' },
      { title: 'VS Code Extension for HTTP Requests', why: 'Developer tooling — Postman\'s community focus' },
      { title: 'OpenAPI Spec Generator', why: 'API documentation automation — Postman\'s product vision' },
    ],
    scorecard: ['Master REST API design principles', 'Build a developer tool project', 'Know HTTP deeply (methods, status codes, headers)', 'Practice JavaScript (async, promises, Node.js)', 'Contribute to an open-source project'],
  },

  // ── Finance companies (simplified prep data) ────────────────────────────────

  'goldman-sachs': {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Trading platform simulations', 'Risk analytics tools', 'Financial data pipelines', 'Algorithm-intensive backends'],
      keySkills: ['Java', 'C++', 'Python', 'Algorithms', 'Data Structures', 'SQL', 'Financial Modeling'],
      bulletExamples: [
        'Built market risk aggregation pipeline processing 1M+ positions daily with < 5-minute SLA.',
        'Implemented option pricing model using Black-Scholes in Python with Monte Carlo simulation.',
        'Optimized order matching engine in Java achieving 2× throughput improvement.',
      ],
      commonMistakes: [
        'No financial domain awareness in project descriptions',
        'Weak quantitative or mathematical background for technology roles',
        'Generic web projects with no systems programming depth',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not primary for technology division roles' },
      backend:      { level: H, note: 'Java, C++ — trading systems and risk engines' },
      dsa:          { level: H, note: 'Strong DSA required — competitive level' },
      database:     { level: M, note: 'SQL, timeseries databases for financial data' },
      cloud:        { level: M, note: 'GS Cloud (private + public hybrid)' },
      devops:       { level: L, note: 'Not primary for interns' },
      systemDesign: { level: H, note: 'Low-latency trading system design' },
    },
    interviewFocus: ['Advanced DSA', 'C++/Java Proficiency', 'Quantitative Aptitude', 'System Design (low-latency)', 'Behavioral'],
    hiringProcess: ['Campus Drive / Online Application', 'Online Assessment (advanced DSA + aptitude)', 'Technical Interview (2–3 rounds)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Option Pricing Tool', why: 'Quantitative finance — Black-Scholes, Monte Carlo' },
      { title: 'Portfolio Risk Dashboard', why: 'Risk analytics — core Goldman Sachs domain' },
      { title: 'Algorithmic Trading Simulator', why: 'Shows quant + engineering intersection' },
      { title: 'Market Data Pipeline', why: 'Financial data processing at scale' },
    ],
    scorecard: ['Strong competitive programming background', 'Learn quantitative finance basics', 'Master C++ or Java deeply', 'Study low-latency system design', 'Practice quantitative aptitude tests'],
  },

  jpmorgan: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Banking and payments systems', 'Fraud detection tools', 'Data analytics platforms', 'Blockchain experiments'],
      keySkills: ['Java', 'Python', 'SQL', 'Data Structures', 'REST APIs', 'Spring Boot', 'AWS'],
      bulletExamples: [
        'Built fraud detection classifier with 92% precision deployed on AWS Lambda for real-time scoring.',
        'Designed transaction monitoring API processing 50K events/day with anomaly flagging.',
        'Implemented blockchain-based audit trail for loan approval workflow using Hyperledger Fabric.',
      ],
      commonMistakes: [
        'No financial or banking domain projects',
        'Missing compliance or security awareness in technical projects',
        'Generic backend projects with no scale or reliability focus',
      ],
    },
    skills: {
      frontend:     { level: M, note: 'Digital banking portal development' },
      backend:      { level: H, note: 'Java, Spring Boot — core banking services' },
      dsa:          { level: H, note: 'Strong OA filter — medium to hard' },
      database:     { level: H, note: 'Oracle, SQL — financial record management' },
      cloud:        { level: M, note: 'AWS, Azure — hybrid cloud strategy' },
      devops:       { level: M, note: 'CI/CD, containerization awareness' },
      systemDesign: { level: H, note: 'Banking scale reliability and compliance' },
    },
    interviewFocus: ['DSA (Medium–Hard)', 'System Design (banking)', 'Java/Spring Boot', 'SQL & Data', 'Behavioral (leadership)'],
    hiringProcess: ['Online Application / Code for Good', 'Online Assessment', 'Technical Interview (2 rounds)', 'Managerial Round', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Digital Banking Dashboard', why: 'Core JPMorgan consumer product domain' },
      { title: 'Fraud Detection System', why: 'Risk management — critical for banking' },
      { title: 'Loan Approval Workflow', why: 'Automated decision systems — key fintech area' },
      { title: 'Transaction Analytics Pipeline', why: 'Data engineering for financial reporting' },
    ],
    scorecard: ['Practice DSA (Medium–Hard)', 'Build a banking-domain project', 'Know Spring Boot and Java deeply', 'Learn SQL optimization', 'Research JPMorgan Code for Good initiative'],
  },

  paytm: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Payment and wallet apps', 'Fintech dashboards', 'Mini-app development', 'Merchant tools'],
      keySkills: ['Java', 'Node.js', 'React', 'MySQL', 'Redis', 'Android/Kotlin', 'Data Structures'],
      bulletExamples: [
        'Built mini-app for bill payment using Paytm Mini SDK, processing 1K test transactions.',
        'Developed merchant analytics dashboard in React with daily revenue, GMV and refund metrics.',
        'Implemented wallet balance deduction with distributed lock to prevent race conditions.',
      ],
      commonMistakes: [
        'No UPI or payment system knowledge in project descriptions',
        'Missing concurrency considerations in financial applications',
        'Weak Android/mobile skills for a mobile-first company',
      ],
    },
    skills: {
      frontend:     { level: H, note: 'React + Android/Kotlin — Paytm is mobile-first' },
      backend:      { level: H, note: 'Java, Node.js — payment processing services' },
      dsa:          { level: M, note: 'Standard OA difficulty' },
      database:     { level: M, note: 'MySQL, Redis — transaction and session data' },
      cloud:        { level: M, note: 'AWS deployment' },
      devops:       { level: L, note: 'Not primary for interns' },
      systemDesign: { level: M, note: 'Wallet, payments, mini-apps platform design' },
    },
    interviewFocus: ['DSA (Medium)', 'Android/Mobile Development', 'Payment System Basics', 'OOP', 'Behavioral'],
    hiringProcess: ['Campus / Online Application', 'Online Assessment', 'Technical Interview (Mobile/Backend)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Digital Wallet App', why: 'Core Paytm product — transactions, balance, history' },
      { title: 'QR Code Payment System', why: 'Scan-to-pay — Paytm\'s flagship feature' },
      { title: 'Bill Payment Aggregator', why: 'Paytm\'s multi-biller integration use case' },
      { title: 'Merchant POS Dashboard', why: 'Paytm for Business — B2B product domain' },
    ],
    scorecard: ['Build a mobile payment project (Android)', 'Understand UPI transaction flow', 'Practice DSA (Medium)', 'Learn concurrency in payment systems', 'Research Paytm ecosystem (Mini apps, Payments Bank)'],
  },

  // Default prep data for companies without specific profiles
  default: {
    resumeStrategy: {
      preferredLength: '1 page for internship applications',
      preferredProjects: ['End-to-end engineering projects', 'Open-source contributions', 'Projects solving real problems with measurable outcomes'],
      keySkills: ['Data Structures', 'Algorithms', 'Relevant programming languages', 'Core CS fundamentals'],
      bulletExamples: [
        'Quantify your impact: "Reduced load time by 40% using lazy loading and image optimization"',
        'Show scale: "API serving 10K daily requests with 99.9% uptime"',
        'Demonstrate ownership: "Led end-to-end design and implementation of the authentication module"',
      ],
      commonMistakes: [
        'Vague bullet points without measurable impact',
        'Listing technologies without demonstrating projects using them',
        'Multi-page resume for internship applications',
        'Not tailoring resume to the job description',
      ],
    },
    skills: {
      frontend:     { level: M, note: 'Depends on the role applied for' },
      backend:      { level: H, note: 'Backend skills are broadly valued' },
      dsa:          { level: H, note: 'Core screening criterion at most tech companies' },
      database:     { level: M, note: 'SQL fundamentals broadly expected' },
      cloud:        { level: M, note: 'Cloud familiarity increasingly valued' },
      devops:       { level: L, note: 'Basic CI/CD knowledge is a plus' },
      systemDesign: { level: M, note: 'Expected at technical interview stage' },
    },
    interviewFocus: ['Data Structures & Algorithms', 'Coding Proficiency', 'Project Deep-dive', 'CS Fundamentals', 'Behavioral / Communication'],
    hiringProcess: ['Online Application', 'Online Assessment', 'Technical Interview', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'End-to-end Web Application', why: 'Demonstrates full-stack thinking and product ownership' },
      { title: 'Algorithm Visualization Tool', why: 'Shows DSA knowledge with strong visual presentation' },
      { title: 'CLI Developer Tool', why: 'Utility tools show engineering pragmatism' },
      { title: 'Open Source Contribution', why: 'Collaborative, real-world engineering experience' },
    ],
    scorecard: ['Practice DSA (LeetCode Medium)', 'Build 2–3 substantial projects', 'Craft a 1-page quantified resume', 'Study core CS fundamentals (OS, DBMS, Networks)', 'Prepare STAR behavioral stories'],
  },
};

// ─── ECE Companies ─────────────────────────────────────────────────────────────
export const ECE_PREP = {

  ti: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Microcontroller projects', 'Analog circuit design', 'Embedded systems with sensors', 'Power management circuits'],
      keySkills: ['C (Embedded)', 'MATLAB', 'Altium/KiCad', 'MCU Programming (MSP430, ARM)', 'Analog Circuit Design', 'SPICE Simulation'],
      bulletExamples: [
        'Designed and fabricated 5W flyback converter with 89% efficiency using TI UC3842 controller.',
        'Implemented I2C sensor library for MSP430 in C, reducing calibration time by 40%.',
        'Built autonomous line-following robot using TI LaunchPad with PID motor control.',
      ],
      commonMistakes: [
        'No hands-on embedded project experience',
        'Theoretical circuit knowledge without lab/simulation work',
        'Missing technical depth on microcontroller peripherals (UART, SPI, I2C)',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant' },
      backend:      { level: L, note: 'Limited to embedded firmware' },
      dsa:          { level: M, note: 'Standard OA — not competitive programming level' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: L, note: 'Not primary for hardware roles' },
      devops:       { level: L, note: 'Not primary' },
      systemDesign: { level: M, note: 'Embedded system architecture design' },
    },
    interviewFocus: ['Analog Circuit Design', 'Embedded C Programming', 'Microcontroller Peripherals', 'Signal Processing Basics', 'Aptitude/DSA'],
    hiringProcess: ['Campus Drive', 'Online Assessment (Aptitude + Technical)', 'Technical Interview (Circuits + Embedded)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'SMPS / Power Converter', why: 'TI\'s core analog domain — power management ICs' },
      { title: 'Embedded Sensor System (IoT)', why: 'MCU + peripherals — TI LaunchPad ecosystem' },
      { title: 'Motor Control with PID', why: 'Control systems — applied embedded engineering' },
      { title: 'Signal Conditioning Circuit', why: 'Analog front-end — TI amplifier product domain' },
    ],
    scorecard: ['Strong analog circuit design skills', 'Build at least 2 hardware projects', 'Program a TI LaunchPad/MSP430', 'Know UART, SPI, I2C protocols', 'Practice SPICE simulation'],
  },

  qualcomm: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['VLSI/RTL design projects', '5G or wireless communication simulation', 'FPGA implementations', 'DSP algorithms'],
      keySkills: ['SystemVerilog', 'Verilog', 'VLSI Design', '5G/LTE protocols', 'MATLAB', 'C/C++', 'UVM'],
      bulletExamples: [
        'Implemented AHB-to-APB bridge in SystemVerilog with full UVM testbench, achieving 100% functional coverage.',
        'Designed 8-bit RISC processor in Verilog, synthesized with Synopsys Design Compiler at 100MHz.',
        'Simulated OFDM modem in MATLAB achieving BER of 10⁻⁴ at 20dB SNR.',
      ],
      commonMistakes: [
        'No RTL coding experience — this is non-negotiable for VLSI roles',
        'Only software projects in portfolio — no hardware depth',
        'Missing verification experience (UVM/testbench writing)',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant for hardware roles' },
      backend:      { level: L, note: 'Limited to embedded software for modem teams' },
      dsa:          { level: M, note: 'Standard OA expected' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: L, note: 'Not primary' },
      devops:       { level: L, note: 'Not primary for hardware roles' },
      systemDesign: { level: H, note: 'Chip architecture and SoC integration design' },
    },
    interviewFocus: ['RTL Coding (SystemVerilog)', 'VLSI Design (timing, synthesis)', 'Digital Design Fundamentals', '5G/Wireless Protocols', 'DSP Concepts', 'Aptitude'],
    hiringProcess: ['Campus Drive', 'Online Assessment', 'Technical Interview (RTL + VLSI)', 'Technical Interview Round 2 (Domain-specific)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'RISC Processor in Verilog', why: 'RTL design capstone — shows complete digital design skills' },
      { title: 'AHB/APB Bus Protocol Implementation', why: 'SoC interconnect — Qualcomm chip integration domain' },
      { title: 'OFDM Modem Simulation in MATLAB', why: '5G modulation — directly relevant to Qualcomm\'s modems' },
      { title: 'UVM Testbench for FIFO', why: 'Verification engineering — critical for Qualcomm hiring' },
    ],
    scorecard: ['Master SystemVerilog RTL coding', 'Complete a full chip design project', 'Know UVM verification methodology', 'Study 5G/LTE protocol basics', 'Practice MATLAB signal processing'],
  },

  intel: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['CPU/SoC architecture projects', 'RTL design and verification', 'FPGA implementations', 'EDA tool projects'],
      keySkills: ['Verilog', 'SystemVerilog', 'C/C++', 'VLSI', 'CPU Architecture', 'DFT', 'FPGA'],
      bulletExamples: [
        'Designed 5-stage pipelined processor in Verilog with hazard detection and forwarding logic.',
        'Implemented DFT scan chain insertion for a UART IP, achieving 98% fault coverage.',
        'Developed cache coherency protocol simulation in C++ for multi-core processor model.',
      ],
      commonMistakes: [
        'No understanding of CPU architecture (pipelines, caches, memory hierarchy)',
        'RTL coding errors in interview — practice is essential',
        'Missing DFT or physical design awareness for hardware roles',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant for hardware roles' },
      backend:      { level: L, note: 'C++ for architecture simulation tools only' },
      dsa:          { level: M, note: 'Standard OA difficulty' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: L, note: 'Not primary' },
      devops:       { level: L, note: 'Not primary' },
      systemDesign: { level: H, note: 'Chip architecture, memory subsystem design' },
    },
    interviewFocus: ['CPU Architecture (Pipeline, Cache)', 'RTL Design (Verilog/SV)', 'DFT Concepts', 'C/C++ for Tools', 'Digital Design Fundamentals'],
    hiringProcess: ['Campus Drive / Online Application', 'Online Assessment', 'Technical Interview (RTL/Architecture)', 'Technical Interview Round 2', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Pipelined RISC-V Processor', why: 'CPU architecture — Intel\'s core domain' },
      { title: 'Cache Simulator (Direct/Set-associative)', why: 'Memory hierarchy — fundamental Intel engineering topic' },
      { title: 'DFT Scan Chain Implementation', why: 'Test engineering — critical for semiconductor manufacturing' },
      { title: 'FPGA Accelerator for Image Processing', why: 'Intel PSG (Altera FPGAs) — direct product domain' },
    ],
    scorecard: ['Master Verilog and SystemVerilog', 'Understand CPU pipeline and cache design', 'Know DFT basics (scan, BIST, JTAG)', 'Build a RISC-V processor project', 'Study computer architecture (Patterson & Hennessy)'],
  },

  amd: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['GPU/CPU architecture design', 'RTL design and verification', 'FPGA implementations', 'Performance analysis tools'],
      keySkills: ['SystemVerilog', 'Verilog', 'UVM', 'C++', 'GPU Architecture', 'VLSI', 'Physical Design'],
      bulletExamples: [
        'Implemented RTL for AXI4-Lite slave interface in SystemVerilog with full self-checking testbench.',
        'Designed GPU rasterizer pipeline stage in Verilog, validated against CUDA software model.',
        'Optimized physical design floorplan reducing wire length by 15% using Cadence Innovus.',
      ],
      commonMistakes: [
        'No RTL experience for VLSI roles',
        'GPU architecture knowledge gap for GPU design teams',
        'Missing UVM/verification skills',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant' },
      backend:      { level: L, note: 'C++ for simulation and EDA tools' },
      dsa:          { level: M, note: 'Standard OA expected' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: L, note: 'Not primary for hardware roles' },
      devops:       { level: L, note: 'Not primary' },
      systemDesign: { level: H, note: 'GPU/CPU architecture, SoC integration' },
    },
    interviewFocus: ['RTL Coding (SystemVerilog)', 'GPU/CPU Architecture', 'UVM Verification', 'Physical Design Concepts', 'Digital Design'],
    hiringProcess: ['Campus Drive / Online Application', 'Online Assessment', 'Technical Interview (RTL)', 'Technical Interview (Architecture)', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'GPU Shader Pipeline Simulation', why: 'AMD Radeon domain — graphics pipeline architecture' },
      { title: 'AXI Bus Protocol in SystemVerilog', why: 'SoC interconnect — AMD chip integration' },
      { title: 'UVM Testbench Suite for FIFO/Memory', why: 'Verification engineering — AMD\'s large verification teams' },
      { title: 'FPGA Implementation of FFT', why: 'Signal processing acceleration — Xilinx (AMD) domain' },
    ],
    scorecard: ['Master SystemVerilog and UVM', 'Understand GPU architecture (SIMD, wavefronts)', 'Build an RTL design project end-to-end', 'Know physical design basics', 'Study Hennessy & Patterson (Computer Architecture)'],
  },

  broadcom: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Networking ASIC design', 'Switch/router protocol simulation', 'Verification testbenches', 'Firmware for networking chips'],
      keySkills: ['SystemVerilog', 'C', 'UVM', 'Networking Protocols (Ethernet, PCIe)', 'ASIC Design', 'Python (for scripting)'],
      bulletExamples: [
        'Implemented Ethernet MAC controller in SystemVerilog with UVM testbench achieving 95% code coverage.',
        'Developed PCIe Gen3 compliance test scripts in Python, automating 80% of manual test cases.',
        'Designed QoS scheduler for network switch fabric in RTL, supporting 8 priority queues.',
      ],
      commonMistakes: [
        'No networking protocol knowledge (Ethernet, PCIe, TCP/IP stack)',
        'Missing ASIC design experience',
        'Weak verification skills for a company with large verification teams',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant' },
      backend:      { level: L, note: 'C firmware for ASIC embedded cores' },
      dsa:          { level: M, note: 'Standard OA expected' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: L, note: 'Not primary for hardware roles' },
      devops:       { level: L, note: 'Not primary' },
      systemDesign: { level: H, note: 'Networking ASIC and switch architecture design' },
    },
    interviewFocus: ['ASIC Design (RTL)', 'Networking Protocols (Ethernet, PCIe)', 'UVM Verification', 'Digital Design Fundamentals', 'Problem Solving'],
    hiringProcess: ['Campus Drive / Online Application', 'Online Assessment', 'Technical Interview (RTL + Networking)', 'Technical Interview Round 2', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Ethernet MAC Controller in SystemVerilog', why: 'Core Broadcom domain — networking ASICs' },
      { title: 'PCIe Protocol Checker (Simulation)', why: 'Broadcom makes PCIe switches — verification tool' },
      { title: 'Network Switch Fabric Model', why: 'Switching architecture — Broadcom\'s primary product' },
      { title: 'QoS Traffic Scheduler', why: 'Quality of service — critical for enterprise networking chips' },
    ],
    scorecard: ['Master SystemVerilog and UVM verification', 'Learn Ethernet and PCIe protocol basics', 'Build a networking protocol RTL project', 'Understand ASIC design flow (RTL → GDS)', 'Study OSI networking model deeply'],
  },

  cadence: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['EDA tool development', 'RTL design and simulation', 'Physical design automation', 'Algorithm implementation in C++'],
      keySkills: ['C++', 'Python', 'Tcl', 'Verilog/SystemVerilog', 'VLSI', 'Algorithms', 'EDA Knowledge'],
      bulletExamples: [
        'Developed Python script automating DRC violation categorization in Virtuoso, saving 3 hours per signoff run.',
        'Implemented placement algorithm in C++ reducing routing congestion by 12% on benchmark circuits.',
        'Built RTL simulation automation framework in Tcl/Python, reducing regression runtime by 40%.',
      ],
      commonMistakes: [
        'No EDA tool usage experience — Cadence expects familiarity with their tools',
        'Weak C++ skills for a tool development company',
        'Generic projects with no connection to chip design or EDA domain',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'GUI development for tools (limited scope)' },
      backend:      { level: H, note: 'C++ — EDA tool development is the core product' },
      dsa:          { level: H, note: 'Algorithms and graph theory are critical for EDA' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: M, note: 'Cadence Cloud, remote simulation environments' },
      devops:       { level: M, note: 'Build systems, regression automation' },
      systemDesign: { level: H, note: 'Algorithm design for placement, routing, synthesis' },
    },
    interviewFocus: ['C++ (strong)', 'Algorithms (graphs, optimization)', 'VLSI Design Flow', 'DSA (Medium–Hard)', 'EDA Concepts'],
    hiringProcess: ['Campus Drive / Online Application', 'Online Assessment (C++ + Algorithms)', 'Technical Interview (C++ + EDA)', 'Technical Interview Round 2', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'Placement Algorithm for Standard Cells', why: 'Core EDA problem — Cadence tools solve this' },
      { title: 'Graph-based Netlist Analyzer', why: 'EDA uses graph representations for circuit netlists' },
      { title: 'Automated DRC Script (Virtuoso)', why: 'Shows tool familiarity and automation skills' },
      { title: 'Logic Synthesis Tool (mini)', why: 'Truth table to gate — shows digital design + algorithm skills' },
    ],
    scorecard: ['Strong C++ programming', 'Understand VLSI design flow (RTL → tapeout)', 'Learn graph algorithms (used in routing)', 'Use Cadence tools (free academic licenses available)', 'Study EDA fundamentals (Sherwani\'s Algorithms for VLSI)'],
  },

  synopsys: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['EDA-related tools', 'RTL design and simulation', 'Hardware security research', 'Compiler or software analysis tools'],
      keySkills: ['C++', 'Python', 'SystemVerilog', 'Tcl', 'Formal Verification', 'Algorithms', 'VLSI'],
      bulletExamples: [
        'Developed Tcl script for post-synthesis timing report parsing in Design Compiler, automating QoR analysis.',
        'Built property checker for AHB protocol using formal methods (SystemVerilog Assertions).',
        'Implemented branch predictor simulation in C++ with 93% accuracy on SPEC CPU benchmarks.',
      ],
      commonMistakes: [
        'No formal verification or assertion-based verification knowledge',
        'Weak C++ for a tool-development-heavy company',
        'No awareness of Synopsys product portfolio (Design Compiler, VCS, VC Formal)',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant' },
      backend:      { level: H, note: 'C++ — synthesis, simulation engine development' },
      dsa:          { level: H, note: 'Algorithm depth important for EDA tools' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: M, note: 'Synopsys.ai Cloud — growing importance' },
      devops:       { level: M, note: 'Regression automation, build systems' },
      systemDesign: { level: H, note: 'Algorithm design for synthesis, formal verification' },
    },
    interviewFocus: ['C++ (strong)', 'Formal Verification (SVA, properties)', 'RTL Design', 'DSA (Medium–Hard)', 'VLSI Design Concepts'],
    hiringProcess: ['Campus Drive / Online Application', 'Online Assessment (C++/Algorithms)', 'Technical Interview (C++ + Domain)', 'Technical Interview Round 2', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'RTL Lint Checker in Python', why: 'Code quality tool for HDL — EDA domain' },
      { title: 'Property Specification with SVA', why: 'Formal verification — Synopsys VC Formal domain' },
      { title: 'Logic Optimizer (Boolean Minimization)', why: 'Synthesis tool core — Karnaugh, Espresso algorithm' },
      { title: 'Simulation Regression Framework', why: 'VCS-like automation — Synopsys tool workflow' },
    ],
    scorecard: ['Master C++ for EDA tool development', 'Learn SystemVerilog Assertions (SVA)', 'Understand synthesis and formal verification flows', 'Use VCS/Design Compiler (academic licenses)', 'Study Synopsys engineering blog and product documentation'],
  },

  // ECE Default
  default: {
    resumeStrategy: {
      preferredLength: '1 page',
      preferredProjects: ['Hardware design projects', 'Embedded systems', 'Signal processing implementations', 'PCB or FPGA projects'],
      keySkills: ['Domain-specific hardware skills', 'C/Embedded C', 'MATLAB', 'Simulation tools', 'Circuit design'],
      bulletExamples: [
        'Designed and tested X circuit achieving Y% efficiency improvement.',
        'Implemented Z algorithm in embedded C on ARM MCU, reducing processing time by N%.',
        'Built complete hardware system from schematic to working prototype using PCB design tools.',
      ],
      commonMistakes: [
        'Only software projects with no hardware depth for ECE roles',
        'Theoretical circuit knowledge without hands-on lab or simulation work',
        'Missing knowledge of core domain tools (MATLAB, SPICE, Cadence, etc.)',
      ],
    },
    skills: {
      frontend:     { level: L, note: 'Not relevant for ECE hardware roles' },
      backend:      { level: L, note: 'Embedded firmware only' },
      dsa:          { level: M, note: 'Standard aptitude and coding OA' },
      database:     { level: L, note: 'Not primary' },
      cloud:        { level: L, note: 'Not primary for hardware roles' },
      devops:       { level: L, note: 'Not primary' },
      systemDesign: { level: M, note: 'Hardware system architecture design' },
    },
    interviewFocus: ['Domain Technical Knowledge', 'Analog/Digital Circuit Fundamentals', 'Embedded Programming', 'Signal Processing', 'Aptitude & DSA'],
    hiringProcess: ['Campus Drive', 'Online Assessment (Aptitude + Technical)', 'Technical Interview', 'HR Round', 'Offer'],
    projectIdeas: [
      { title: 'FPGA-based Signal Processor', why: 'Hardware acceleration — valued in semiconductor companies' },
      { title: 'Embedded Sensor Network', why: 'IoT + embedded systems — broad ECE relevance' },
      { title: 'Power Electronics Circuit Design', why: 'Simulation to hardware — fundamental ECE engineering' },
      { title: 'Communication Protocol Implementation', why: 'UART/SPI/I2C on MCU — practical embedded skill' },
    ],
    scorecard: ['Build at least 2 hardware projects', 'Strong domain fundamentals (circuits/signals/VLSI)', 'Practice coding for OA (DSA basics)', 'Learn industry EDA/simulation tools', 'Prepare project walkthroughs with technical depth'],
  },
};

/**
 * Get prep data for a company by its ID
 * @param {string} id - Company ID from companiesData.js
 * @param {'it'|'ece'} tab - Which database to look up
 * @returns {object} Prep data object
 */
export function getCompanyPrep(id, tab = 'it') {
  const db = tab === 'ece' ? ECE_PREP : IT_PREP;
  return db[id] || db['default'];
}
