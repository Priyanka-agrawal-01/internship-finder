# InternPulse 🚀

InternPulse is a full-stack internship and job aggregator. It pulls live postings from public job APIs, merges and de-duplicates them, and lets students subscribe to email alerts for new internships that match their interests.

---

## 📂 Project Structure

```text
project_1/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # MongoDB connection (optional — app runs without it)
│   │   │   └── mail.js           # Nodemailer transport: SMTP → Gmail → Ethereal → console
│   │   ├── middleware/
│   │   │   ├── security.js       # Rate limiting, admin-token check, async error wrapper
│   │   │   └── auth.js           # Sign-in sessions (Bearer tokens), requireAuth
│   │   ├── models/
│   │   │   ├── Subscriber.js     # Alert subscribers + preferences
│   │   │   ├── User.js / Session.js / SavedItem.js  # Accounts, sign-in sessions, bookmarked + applied items
│   │   │   ├── AlertRun.js       # One per hourly alert cycle (so two servers never both send it) with its counts
│   │   │   ├── Visit.js          # Anonymous page views for the admin panel
│   │   │   └── JobSnapshot.js    # Every job ever seen (used to detect new ones)
│   │   ├── routes/
│   │   │   ├── jobRoutes.js      # /api/jobs
│   │   │   ├── subscribeRoutes.js# /api/subscribe
│   │   │   ├── authRoutes.js     # /api/auth (register, login, Google, me, logout, delete)
│   │   │   ├── meRoutes.js       # /api/me/saved
│   │   │   ├── adminRoutes.js    # /api/admin (admin account only)
│   │   │   └── analyticsRoutes.js# /api/analytics/visit
│   │   ├── services/
│   │   │   ├── jobService.js     # Fetches, normalises, caches jobs from 5 APIs
│   │   │   ├── jobMatcher.js     # Matches jobs to alert preferences (pure functions)
│   │   │   ├── alertService.js   # Hourly cron that emails new matching jobs
│   │   │   └── emailService.js   # Welcome / alert / unsubscribe email templates
│   │   ├── utils/                # HTML escaping, input validation
│   │   └── server.js             # Express entry point
│   ├── scripts/create-admin.js   # npm run create-admin: makes the admin account
│   ├── test/                     # node:test unit tests
│   └── .env.example
│
├── frontend/                     # Vite, two pages
│   ├── index.html                # Landing page: static HTML on the design kit (no React)
│   ├── app.html                  # The React app: app.html#jobs, #companies, #resources, #blog, #about, #alerts
│   ├── public/assets/            # Design kit (taste-skill): CSS, motion, UI fragments, diagrams, effects.
│   │                             #   Keep these files unedited: the kit's checks require them to ship as they are.
│   ├── src/
│   │   ├── auth/                 # Sign-in state and dialog (email + password, Google)
│   │   ├── saved/                # Bookmarked / applied items: browser for guests, account when signed in
│   │   ├── lib/api.js            # Backend address and fetch helper
│   │   ├── components/           # Navbar, SearchFilter, JobCard, SaveButtons
│   │   ├── pages/                # Companies, Resources, Blog, About, Alerts, My Jobs, Admin
│   │   ├── data/                 # Static content for the guide pages
│   │   ├── App.jsx               # Jobs dashboard, filtering & sorting, hash routing
│   │   └── main.jsx
│   └── .env.example
│
└── README.md
```

---

## ⚡ Quick Start

Requires [Node.js](https://nodejs.org/) 20 or newer.

### Backend
```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5000 (auto-reloads)
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### Checks
```bash
cd backend  && npm test       # unit tests
cd frontend && npm run lint   # ESLint
cd frontend && npm run build  # production build
```

---

## ⚙️ Environment Variables

All backend variables are documented in [`backend/.env.example`](backend/.env.example). The backend runs with **zero configuration**: without `MONGODB_URI` subscriptions are kept in memory (and alerts are off), and without SMTP settings emails go to a throwaway [Ethereal](https://ethereal.email) inbox whose preview links are printed in the log.

| Variable | Purpose |
|---|---|
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated. The first is used for links in emails. **Must include your deployed frontend URL** or the browser will block API calls. |
| `BACKEND_URL` | Public URL of the API, used for unsubscribe links in emails. Falls back to Render's `RENDER_EXTERNAL_URL`. |
| `MONGODB_URI` | Enables persistent subscribers and job alerts. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Real email delivery. Or use `EMAIL_SERVICE` / `EMAIL_USER` / `EMAIL_PASS` for Gmail (needs a 16-character App Password). |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`, `RAPIDAPI_KEY` | Optional keyed job sources (Adzuna, JSearch). |
| `ADMIN_TOKEN` | Enables admin endpoints; send it as the `x-admin-token` header. Unset = endpoints disabled. |
| `ALERT_CRON` | Alert schedule, default hourly (`0 * * * *`). Servers sharing one database (say, your laptop and Render) take turns: only one sends each hour's alerts. |
| `GOOGLE_CLIENT_ID` | Turns on *Continue with Google* (see [Accounts](#accounts-and-my-jobs)). Set it on the backend only; the frontend reads it from `/api/auth/config`. |
| `ANALYTICS_RECORD_LOCAL` | `true` counts visits from pages served on `localhost` (off by default, so testing doesn't inflate the numbers). |
| `DNS_SERVERS` | Fallback DNS for the `mongodb+srv://` lookup, default `1.1.1.1,8.8.8.8`. Only used when the system's DNS fails. |

Frontend: set `VITE_API_URL` to the deployed backend URL (see [`frontend/.env.example`](frontend/.env.example)). On `localhost` the app always talks to `http://localhost:5000`.

> Never commit `.env` files. If one was ever pushed, rotate every secret in it — deleting the file does not remove it from git history.

---

## 🌐 How It Works

### Job fetching & caching
- `jobService.js` queries **Remotive, Arbeitnow, The Muse** (free) and **Adzuna, JSearch** (keyed) in parallel. A failing source is logged with its reason and simply contributes no jobs.
- Results are normalised to one shape (`id`, `title`, `company`, `location`, `country`, `workMode`, `tags`, `stipend`, `isInternship`, `isNew`, `postedAt`, …), filtered to the last 60 days, and de-duplicated by URL and title+company.
- The merged list is cached in memory for **30 minutes**. Concurrent requests share a single upstream fetch, and a stale cache is served instantly while it refreshes in the background.
- Only real API data is shown — nothing is hardcoded into the feed. `isInternship` is detected from keywords (intern, co-op, trainee, graduate program…), and the UI reports internships and total openings separately.

### Job alerts
- Subscribers pick companies, roles, locations and a frequency (hourly, every 6 hours, daily) on the Alerts page.
- An hourly cron (`alertService.js`) records newly seen jobs in `JobSnapshot`, then emails each subscriber who is due the jobs first seen since their last alert that match their preferences (up to 5 per email).
- Role and location keywords are matched as whole words (so "AI" doesn't match "trainee" and "Java" doesn't match "JavaScript").
- Every email has a one-click unsubscribe link and `List-Unsubscribe` headers. Typing an address into the Unsubscribe form emails that inbox a confirmation link rather than unsubscribing immediately.

### Accounts and My Jobs
- Signing in is optional. Anyone can press **Bookmark** or **Mark applied** on a job card or a company card; a guest's items are kept in the browser.
- **Sign in** with an email and password, or with **Continue with Google** once `GOOGLE_CLIENT_ID` is set. On sign-in, whatever was saved as a guest moves into the account, so it shows on every device.
- **My Jobs** (`app.html#myjobs`) has two sections, *Applied* and *Bookmarked*. Each has its own filters: search, jobs or companies, work mode, internship or full-time, job board, location, and sort order.
- Passwords are hashed with scrypt; sessions are random tokens of which the database stores only a SHA-256; sign-in is rate limited. A Google sign-in links to an existing account with the same email (and, because email sign-ups are not verified, removes that account's password and ends its sessions). *Delete account* on My Jobs removes the account, its sessions and its saved items.
- Accounts need MongoDB. Without it the sign-in endpoints answer 503 and saving keeps working in the browser.

**Setting up Google sign-in:** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth client ID of type *Web application*. Under *Authorized JavaScript origins* add `http://localhost`, `http://localhost:5173` and your Vercel URL. Put the client ID in `GOOGLE_CLIENT_ID` on the backend (Render and `backend/.env`) and restart it.

### Admin panel
- One account is the admin. It is made with a command, never through the website, so nobody can sign up their way into it:
  ```bash
  cd backend && npm run create-admin
  ```
  It asks for the admin's email and password (typing hidden) and writes to the database in `MONGODB_URI`. If someone had already signed up with that email, the account is taken over: its password is replaced and every session on it is signed out. Run it again to change the password; `npm run create-admin -- --remove <email>` turns an admin back into a normal user. On Render, run it once from the service's Shell, or locally against the same database.
- The admin signs in like anyone else and gets an **Admin** tab (`app.html#admin`). Every other part of the site works as usual.
  - **Overview:** visitors today, last 7 and 30 days and on the site right now; page views; accounts, alert subscribers and saved items; the job feed; the last alert run.
  - **Traffic:** visitors per day (7, 30 or 90 days, India time), new and returning visitors, pages, the sites visitors came from, devices, browsers and operating systems.
  - **Accounts:** search, sign-in method, last sign-in, saved counts; unlock an account locked by wrong passwords; delete an account; download as CSV.
  - **Alert subscribers:** search and filter, pause or resume someone's alerts, download as CSV.
  - **Saved jobs:** the most bookmarked and applied-to jobs and companies.
  - **Feed and alerts:** listings per source (a source with 0 is flagged), work modes, countries, *Refresh feed now*, a test email to the admin's own address, and every hourly alert run with its counts.
- **Visit counting** (`frontend/public/track.js`, loaded by both pages): a random visitor id in `localStorage`, a session id in `sessionStorage`, the page, the referring site and the device type. No cookies, no IP address, no account or email. Bots, automated browsers and pages served from `localhost` are not counted (set `ANALYTICS_RECORD_LOCAL=true` to count local visits). Visits are kept for a year.
- Every account (the admin's too) is locked for 15 minutes after 10 wrong passwords in a row.

### API

| Method & path | Description |
|---|---|
| `GET /` | Health check, database state and per-source status |
| `GET /api/jobs` | Cached job list + cache metadata |
| `GET /api/jobs/status` | Cache metadata only |
| `POST /api/jobs/refresh` | 🔐 Force a fresh fetch (admin) |
| `POST /api/subscribe` | Subscribe / update preferences (rate limited) |
| `GET /api/subscribe/unsubscribe?token=` | One-click unsubscribe link |
| `POST /api/subscribe/unsubscribe` | `?token=` one-click (RFC 8058) or `{ email }` → emails a confirmation link (rate limited) |
| `GET /api/subscribe/status?email=` | 🔐 Subscriber lookup (admin) |
| `GET /api/auth/config` | Which sign-in methods are on (and the public Google client ID) |
| `POST /api/auth/register` | `{ name?, email, password }` → `{ user, token }` (rate limited) |
| `POST /api/auth/login` | `{ email, password }` → `{ user, token }` (rate limited) |
| `POST /api/auth/google` | `{ credential }` (a Google ID token) → `{ user, token }` (rate limited) |
| `GET /api/auth/me` | 👤 The signed-in user |
| `POST /api/auth/logout` | 👤 Ends this session |
| `DELETE /api/auth/me` | 👤 Deletes the account, its sessions and saved items |
| `GET /api/me/saved` | 👤 Saved jobs and companies |
| `PUT /api/me/saved` | 👤 `{ kind: 'job' \| 'company', itemId, bookmarked?, applied?, data? }`; an item with neither flag is removed |
| `POST /api/me/saved/import` | 👤 Merges up to 500 items saved as a guest |
| `POST /api/analytics/visit` | Records one anonymous page view (sent by `track.js`) |
| `GET /api/admin/overview` · `traffic?days=7\|30\|90` · `saved` · `jobs` · `alerts` | 🛡 Admin panel data |
| `GET /api/admin/users` · `subscribers` (`?q=&page=&status=`) | 🛡 Accounts and subscribers |
| `DELETE /api/admin/users/:id` · `POST /api/admin/users/:id/unlock` · `PATCH /api/admin/subscribers/:id` | 🛡 Delete or unlock an account; pause or resume alerts |
| `GET /api/admin/export/users` · `export/subscribers` | 🛡 CSV downloads |
| `POST /api/admin/jobs/refresh` · `POST /api/admin/email/test` | 🛡 Refresh the feed; email the admin a test |

🔐 needs `x-admin-token`. 👤 needs `Authorization: Bearer <token>` from sign-in. 🛡 needs the same, from the admin account.

---

## 🚀 Deployment

### Backend on Render
1. **New → Web Service**, connect the repo, **Root Directory** `backend`, **Build** `npm install`, **Start** `npm start`.
2. Environment variables: `NODE_ENV=production`, `FRONTEND_URL=<your Vercel URL>`, plus `MONGODB_URI`, SMTP settings, API keys and `ADMIN_TOKEN` as needed. (`BACKEND_URL` is optional on Render.)

> On Render's free tier the service sleeps when idle, so the hourly alert cron only runs while it's awake.

### Frontend on Vercel
1. **Add New → Project**, import the repo, **Root Directory** `frontend` (Vite is auto-detected; output `dist`).
2. Set `VITE_API_URL=<your Render URL>` and deploy.
3. [`frontend/vercel.json`](frontend/vercel.json) sets the security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Its `connect-src` must list the origin of `VITE_API_URL`, and its `script-src` the hash of each inline `<script>` in `index.html`. `npm run build` runs [`scripts/check-csp.js`](frontend/scripts/check-csp.js) first and fails with the value to add when either is missing.
