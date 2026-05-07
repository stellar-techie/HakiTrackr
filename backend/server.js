// server.js — HakiTracker Backend Entry Point

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usageRoutes = require('./routes/usage');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────

// CORS: allow extension and React dashboard
app.use(cors());

app.use(express.json({ limit: '1mb' })); // Limit body size

// Request logger (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────

app.use('/api/usage', usageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Database + Start ─────────────────────────────────────────

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if DB unreachable
    });
    console.log('✓ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`✓ Server running at http://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/health`);
      console.log(`  Usage:  http://localhost:${PORT}/api/usage`);
    });
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err.message);
    console.error('\nMake sure you have:');
    console.error('  1. Created a .env file (copy .env.example)');
    console.error('  2. Added your MongoDB Atlas connection string');
    console.error('  3. Whitelisted your IP in MongoDB Atlas → Network Access\n');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

start();
