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
│   │   │   └── security.js       # Rate limiting, admin-token check, async error wrapper
│   │   ├── models/
│   │   │   ├── Subscriber.js     # Alert subscribers + preferences
│   │   │   └── JobSnapshot.js    # Every job ever seen (used to detect new ones)
│   │   ├── routes/
│   │   │   ├── jobRoutes.js      # /api/jobs
│   │   │   └── subscribeRoutes.js# /api/subscribe
│   │   ├── services/
│   │   │   ├── jobService.js     # Fetches, normalises, caches jobs from 5 APIs
│   │   │   ├── jobMatcher.js     # Matches jobs to alert preferences (pure functions)
│   │   │   ├── alertService.js   # Hourly cron that emails new matching jobs
│   │   │   └── emailService.js   # Welcome / alert / unsubscribe email templates
│   │   ├── utils/                # HTML escaping, input validation
│   │   └── server.js             # Express entry point
│   ├── test/                     # node:test unit tests
│   └── .env.example
│
├── frontend/                     # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Navbar, SearchFilter, JobCard
│   │   ├── pages/                # Companies, Resources, Blog, About, Alerts
│   │   ├── data/                 # Static content for the guide pages
│   │   ├── App.jsx               # Home + jobs dashboard, filtering & sorting
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
| `ALERT_CRON` | Alert schedule, default hourly (`0 * * * *`). |

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

---

## 🚀 Deployment

### Backend on Render
1. **New → Web Service**, connect the repo, **Root Directory** `backend`, **Build** `npm install`, **Start** `npm start`.
2. Environment variables: `NODE_ENV=production`, `FRONTEND_URL=<your Vercel URL>`, plus `MONGODB_URI`, SMTP settings, API keys and `ADMIN_TOKEN` as needed. (`BACKEND_URL` is optional on Render.)

> On Render's free tier the service sleeps when idle, so the hourly alert cron only runs while it's awake.

### Frontend on Vercel
1. **Add New → Project**, import the repo, **Root Directory** `frontend` (Vite is auto-detected; output `dist`).
2. Set `VITE_API_URL=<your Render URL>` and deploy.
