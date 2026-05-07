// models/Usage.js — MongoDB schema for browsing sessions

const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      enum: ['Social', 'Entertainment', 'Productivity', 'Learning', 'News', 'Communication', 'Finance', 'Shopping', 'Gaming', 'Other'],
      default: 'Other',
    },

    duration: {
      type: Number, // milliseconds
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative'],
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    date: {
      type: String, // "YYYY-MM-DD" format for easy day grouping
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Compound index for efficient domain + date queries
usageSchema.index({ domain: 1, date: 1 });
usageSchema.index({ category: 1, date: 1 });

// Virtual: duration in minutes (computed, not stored)
usageSchema.virtual('durationMinutes').get(function () {
  return Math.round(this.duration / 60000);
});

// Static method: get summary for a date range
usageSchema.statics.getSummary = function (startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = startDate;
    if (endDate) match.date.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$domain',
        category: { $first: '$category' },
        totalDuration: { $sum: '$duration' },
        sessionCount: { $sum: 1 },
        lastVisited: { $max: '$timestamp' },
      },
    },
    { $sort: { totalDuration: -1 } },
    { $limit: 50 },
  ]);
};

// Static method: category breakdown
usageSchema.statics.getCategoryBreakdown = function (date) {
  const match = date ? { date } : {};
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        totalDuration: { $sum: '$duration' },
        domainCount: { $addToSet: '$domain' },
      },
    },
    {
      $project: {
        category: '$_id',
        totalDuration: 1,
        domainCount: { $size: '$domainCount' },
      },
    },
    { $sort: { totalDuration: -1 } },
  ]);
};

module.exports = mongoose.model('Usage', usageSchema);
