// controllers/usageController.js — all business logic

const Usage = require('../models/Usage');

// POST /api/usage — Chrome extension sends a session
const createUsage = async (req, res) => {
  try {
    const { domain, category, duration, timestamp, date } = req.body;

    // Validation
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing domain' });
    }
    if (!duration || typeof duration !== 'number' || duration < 0) {
      return res.status(400).json({ error: 'Invalid or missing duration' });
    }
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing date' });
    }

    const entry = new Usage({
      domain: domain.toLowerCase().replace(/^www\./, ''),
      category: category || 'Other',
      duration,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      date,
    });

    await entry.save();
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    console.error('[POST /usage]', err.message);
    res.status(500).json({ error: 'Failed to save session' });
  }
};

// GET /api/usage — raw sessions (with optional date filter)
const getUsage = async (req, res) => {
  try {
    const { date, domain, limit = 1000 } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (domain) filter.domain = domain.toLowerCase();

    const data = await Usage.find(filter)
      .sort({ timestamp: -1 })
      .limit(Math.min(parseInt(limit), 5000)) // Hard cap at 5000
      .lean(); // .lean() returns plain JS objects, faster

    res.json({ count: data.length, data });
  } catch (err) {
    console.error('[GET /usage]', err.message);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// GET /api/usage/summary — aggregated per domain (for dashboard)
const getSummary = async (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;

    // If specific date provided, use that; otherwise use range
    const effectiveStart = date || startDate;
    const effectiveEnd = date || endDate;

    const summary = await Usage.getSummary(effectiveStart, effectiveEnd);

    // Add percentage of total
    const totalMs = summary.reduce((sum, s) => sum + s.totalDuration, 0);
    const withPercent = summary.map((s) => ({
      ...s,
      percentage: totalMs > 0 ? Math.round((s.totalDuration / totalMs) * 100) : 0,
    }));

    res.json({
      totalDuration: totalMs,
      totalSites: summary.length,
      data: withPercent,
    });
  } catch (err) {
    console.error('[GET /usage/summary]', err.message);
    res.status(500).json({ error: 'Failed to get summary' });
  }
};

// GET /api/usage/categories — category breakdown (for pie chart)
const getCategories = async (req, res) => {
  try {
    const { date } = req.query;
    const breakdown = await Usage.getCategoryBreakdown(date);

    const total = breakdown.reduce((sum, c) => sum + c.totalDuration, 0);
    const withPercent = breakdown.map((c) => ({
      ...c,
      percentage: total > 0 ? Math.round((c.totalDuration / total) * 100) : 0,
    }));

    res.json({ totalDuration: total, data: withPercent });
  } catch (err) {
    console.error('[GET /usage/categories]', err.message);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// GET /api/usage/daily — last 7 or 30 days timeline
const getDailyStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const n = Math.min(parseInt(days), 30);

    const results = await Usage.aggregate([
      {
        $group: {
          _id: '$date',
          totalDuration: { $sum: '$duration' },
          siteCount: { $addToSet: '$domain' },
          sessionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          date: '$_id',
          totalDuration: 1,
          siteCount: { $size: '$siteCount' },
          sessionCount: 1,
        },
      },
      { $sort: { date: -1 } },
      { $limit: n },
    ]);

    // Reverse so oldest is first (for charts)
    res.json(results.reverse());
  } catch (err) {
    console.error('[GET /usage/daily]', err.message);
    res.status(500).json({ error: 'Failed to get daily stats' });
  }
};

// DELETE /api/usage — clear all data (for development/reset)
const clearAll = async (req, res) => {
  try {
    const result = await Usage.deleteMany({});
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear data' });
  }
};

module.exports = { createUsage, getUsage, getSummary, getCategories, getDailyStats, clearAll };
