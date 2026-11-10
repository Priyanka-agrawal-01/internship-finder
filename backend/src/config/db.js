'use strict';
const dns      = require('node:dns');
const mongoose = require('mongoose');

// ─── DB connection state ──────────────────────────────────────────────────────
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI not set — running without database. Subscriptions & alert history will not persist.');
    return;
  }

  const connect = () => mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS:          30000,
  });

  try {
    try {
      await connect();
    } catch (err) {
      // A mongodb+srv:// URI needs a DNS SRV lookup. On some Windows machines Node cannot read the
      // system's DNS servers and falls back to 127.0.0.1, where nothing answers (querySrv ECONNREFUSED),
      // although the browser and nslookup resolve fine. Retry once through public resolvers.
      if (!/querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT/.test(err.message) || !uri.startsWith('mongodb+srv://')) throw err;
      const fallback = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8').split(',').map(s => s.trim()).filter(Boolean);
      console.warn(`[MongoDB] SRV lookup failed (${err.message}); retrying with DNS ${fallback.join(', ')}`);
      dns.setServers(fallback);
      await connect();
    }
    isConnected = true;
    console.log('[MongoDB] Connected successfully');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    console.warn('[MongoDB] Continuing without database — subscriptions will use in-memory fallback.');
  }
}

function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isDBConnected };
