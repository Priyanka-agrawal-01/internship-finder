require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const jobRoutes = require('./routes/jobRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS - Allow requests from the configured frontend URL or defaults
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'production') {
      return callback(null, true);
    } else {
      return callback(new Error('Blocked by CORS policy.'));
    }
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'InternPulse API',
    status: 'Healthy',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/subscribe', subscribeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`🚀 InternPulse Express server is active on port ${PORT}`);
  console.log(`🌐 API Health Check: http://localhost:${PORT}/`);
  console.log(`💼 Jobs API: http://localhost:${PORT}/api/jobs`);
  console.log(`=============================================================`);
});
