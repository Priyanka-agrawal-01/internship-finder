require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const { connectDB }           = require('./config/db');
const { startAlertScheduler } = require('./services/alertService');

const jobRoutes       = require('./routes/jobRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
      return cb(null, true);
    }
    cb(new Error('Blocked by CORS policy'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const { isDBConnected } = require('./config/db');
  res.json({
    name:      'InternPulse API v2',
    status:    'Healthy',
    uptime:    `${Math.round(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database:  isDBConnected() ? 'connected' : 'not connected (set MONGODB_URI)',
    sources: {
      remotive:   'active (free)',
      arbeitnow:  'active (free)',
      themuse:    'active (free)',
      adzuna:     process.env.ADZUNA_APP_ID ? 'active (keyed)' : 'not configured',
      jsearch:    process.env.RAPIDAPI_KEY  ? 'active (keyed)' : 'not configured',
    },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/jobs',      jobRoutes);
app.use('/api/subscribe', subscribeRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
    error:   process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ── Boot sequence ─────────────────────────────────────────────────────────────
async function boot() {
  // 1. Connect to MongoDB (gracefully degrades if unavailable)
  await connectDB();

  // 2. Start HTTP server
  app.listen(PORT, () => {
    const sep = '═'.repeat(62);
    console.log(`\n${sep}`);
    console.log(`  🚀 InternPulse API v2  →  http://localhost:${PORT}`);
    console.log(`  💼 Jobs               →  http://localhost:${PORT}/api/jobs`);
    console.log(`  📊 Cache status       →  http://localhost:${PORT}/api/jobs/status`);
    console.log(`  🔔 Subscribe          →  http://localhost:${PORT}/api/subscribe`);
    console.log(`  🚪 Unsubscribe        →  http://localhost:${PORT}/api/subscribe/unsubscribe?token=...`);
    console.log(`${sep}`);
    console.log(`  ✅ Remotive      (free, no key needed)`);
    console.log(`  ✅ Arbeitnow     (free, no key needed)`);
    console.log(`  ✅ The Muse      (free, no key needed)`);
    console.log(`  ${process.env.ADZUNA_APP_ID ? '✅' : '⚪'} Adzuna        ${process.env.ADZUNA_APP_ID ? '(keyed – active)' : '(add ADZUNA_APP_ID + ADZUNA_APP_KEY)'}`);
    console.log(`  ${process.env.RAPIDAPI_KEY  ? '✅' : '⚪'} JSearch       ${process.env.RAPIDAPI_KEY  ? '(keyed – active)' : '(add RAPIDAPI_KEY)'}`);
    console.log(`${sep}`);
    console.log(`  🔄 Job cache auto-refreshes every 30 minutes`);
    console.log(`  🔔 Alert cron runs every 6 hours`);
    console.log(`  🗑️  Jobs older than 60 days removed automatically`);
    console.log(`  🌍  Worldwide listings — India, Remote & global roles`);
    console.log(`${sep}\n`);
  });

  // 3. Start the 6-hour alert cron scheduler
  startAlertScheduler();
}

boot().catch(err => {
  console.error('[Boot] Fatal error:', err.message);
  process.exit(1);
});
