require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const { connectDB, isDBConnected } = require('./config/db');
const { startAlertScheduler }      = require('./services/alertService');
const { getCacheStatus }           = require('./services/jobService');

const jobRoutes       = require('./routes/jobRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// Behind Render/Heroku-style proxies, trust the first hop so req.ip is the
// real client IP (needed for per-IP rate limiting).
if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// ── CORS ─────────────────────────────────────────────────────────────────────
// FRONTEND_URL may hold several origins separated by commas, e.g.
//   FRONTEND_URL=https://internpulse.vercel.app,https://www.internpulse.dev
const normalizeOrigin = o => o.trim().replace(/\/+$/, '');
const allowedOrigins = new Set([
  ...(process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(normalizeOrigin).filter(Boolean),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);
const warnedOrigins = new Set();

app.use(cors({
  origin: (origin, cb) => {
    // Requests without an Origin header (curl, server-to-server, same-origin) are fine
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) return cb(null, true);
    if (!warnedOrigins.has(origin)) {
      warnedOrigins.add(origin);
      console.warn(`[CORS] Blocked request from ${origin}. Add it to FRONTEND_URL (comma-separated) if it is your frontend.`);
    }
    return cb(null, false);
  },
}));

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const counts = getCacheStatus().sourceCounts;
  const sourceState = (name, keyed) => {
    if (keyed === false) return 'not configured';
    if (!counts) return 'not fetched yet';
    return counts[name] > 0 ? `active (${counts[name]} jobs)` : 'returned 0 jobs on last fetch';
  };
  res.json({
    name:      'InternPulse API v2',
    status:    'Healthy',
    uptime:    `${Math.round(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database:  isDBConnected() ? 'connected' : 'not connected (set MONGODB_URI)',
    sources: {
      remotive:  sourceState('remotive'),
      arbeitnow: sourceState('arbeitnow'),
      themuse:   sourceState('muse'),
      adzuna:    sourceState('adzuna',  !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY)),
      jsearch:   sourceState('jsearch', !!process.env.RAPIDAPI_KEY),
    },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/jobs',      jobRoutes);
app.use('/api/subscribe', subscribeRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  // Client errors such as malformed JSON or an oversized body keep their 4xx status
  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500) {
    return res.status(status).json({ success: false, message: 'Invalid request.' });
  }
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
    error:   process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Log stray promise rejections instead of letting one bad request crash the server
process.on('unhandledRejection', err => {
  console.error('[Server] Unhandled promise rejection:', err?.message || err);
});

// ── Boot sequence ─────────────────────────────────────────────────────────────
async function boot() {
  // 1. Connect to MongoDB (gracefully degrades if unavailable)
  await connectDB();

  // 2. Start the alert cron scheduler
  const alertCron = startAlertScheduler();

  // 3. Start HTTP server
  app.listen(PORT, () => {
    const sep = '═'.repeat(62);
    console.log(`\n${sep}`);
    console.log(`  🚀 InternPulse API v2  →  http://localhost:${PORT}`);
    console.log(`  💼 Jobs               →  http://localhost:${PORT}/api/jobs`);
    console.log(`  📊 Cache status       →  http://localhost:${PORT}/api/jobs/status`);
    console.log(`  🔔 Subscribe          →  http://localhost:${PORT}/api/subscribe`);
    console.log(`${sep}`);
    console.log(`  ✅ Remotive      (free, no key needed)`);
    console.log(`  ✅ Arbeitnow     (free, no key needed)`);
    console.log(`  ✅ The Muse      (free, no key needed)`);
    console.log(`  ${process.env.ADZUNA_APP_ID ? '✅' : '⚪'} Adzuna        ${process.env.ADZUNA_APP_ID ? '(keyed – active)' : '(add ADZUNA_APP_ID + ADZUNA_APP_KEY)'}`);
    console.log(`  ${process.env.RAPIDAPI_KEY  ? '✅' : '⚪'} JSearch       ${process.env.RAPIDAPI_KEY  ? '(keyed – active)' : '(add RAPIDAPI_KEY)'}`);
    console.log(`${sep}`);
    console.log(`  🔄 Job cache auto-refreshes every 30 minutes`);
    console.log(`  🔔 Alert cron: "${alertCron}" (each subscriber's frequency is respected)`);
    console.log(`  🗑️  Jobs older than 60 days removed automatically`);
    console.log(`  🔐 Admin endpoints ${process.env.ADMIN_TOKEN ? 'enabled (x-admin-token)' : 'disabled (set ADMIN_TOKEN to enable)'}`);
    console.log(`${sep}\n`);
  });
}

boot().catch(err => {
  console.error('[Boot] Fatal error:', err.message);
  process.exit(1);
});
