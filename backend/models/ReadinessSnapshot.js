const mongoose = require('mongoose')

const ReadinessSnapshotSchema = new mongoose.Schema(
  {
    syncKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    overallScore: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['insufficient_data', 'provisional', 'confident'],
      default: 'insufficient_data',
    },
    confidenceLevel: {
      type: Number,
      default: 0,
    },
    evidenceCoverage: {
      type: Number,
      default: 0,
    },
    scoreExplanation: {
      type: String,
      default: '',
    },
    components: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    strongestPatterns: {
      type: Array,
      default: [],
    },
    weakestPatterns: {
      type: Array,
      default: [],
    },
    insufficientEvidencePatterns: {
      type: Array,
      default: [],
    },
    recommendations: {
      type: Array,
      default: [],
    },
    calculatedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient historical trend lookups by syncKey + calculatedAt
ReadinessSnapshotSchema.index({ syncKey: 1, calculatedAt: -1 })

module.exports =
  mongoose.models.ReadinessSnapshot ||
  mongoose.model('ReadinessSnapshot', ReadinessSnapshotSchema)
