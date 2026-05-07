// routes/usage.js — API routes

const express = require('express');
const router = express.Router();
const {
  createUsage,
  getUsage,
  getSummary,
  getCategories,
  getDailyStats,
  clearAll,
} = require('../controllers/usageController');

// POST   /api/usage          — extension sends a session
router.post('/', createUsage);

// GET    /api/usage          — raw sessions
router.get('/', getUsage);

// GET    /api/usage/summary  — aggregated per domain
router.get('/summary', getSummary);

// GET    /api/usage/categories — category breakdown
router.get('/categories', getCategories);

// GET    /api/usage/daily    — day-by-day stats
router.get('/daily', getDailyStats);

// DELETE /api/usage          — clear all (dev only)
if (process.env.NODE_ENV !== 'production') {
  router.delete('/', clearAll);
}

module.exports = router;
