const mongoose = require('mongoose')

const PatternMetricSchema = new mongoose.Schema(
  {
    patternId: { type: Number, required: true },
    title: { type: String, required: true },
    total: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    soloCount: { type: Number, default: 0 },
    masteredCount: { type: Number, default: 0 },
    hintCount: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    status: { type: String, default: 'weak' },
  },
  { _id: false }
)

const PatternAnalyticsSchema = new mongoose.Schema(
  {
    syncKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    overallConfidence: {
      type: Number,
      default: 0,
    },
    totalSolved: {
      type: Number,
      default: 0,
    },
    totalHints: {
      type: Number,
      default: 0,
    },
    highPriority: [
      {
        id: Number,
        title: String,
        hintCount: Number,
        confidence: Number,
      },
    ],
    patterns: [PatternMetricSchema],
  },
  {
    timestamps: true,
  }
)

module.exports =
  mongoose.models.PatternAnalytics ||
  mongoose.model('PatternAnalytics', PatternAnalyticsSchema)
