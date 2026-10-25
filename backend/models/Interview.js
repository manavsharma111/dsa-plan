const mongoose = require('mongoose')

const InterviewProblemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    difficulty: { type: String, default: 'M' },
    lc: { type: String, default: '' },
    url: { type: String, default: '' },
    slug: { type: String, default: '' },
    platform: { type: String, default: 'LC' },
    patternTitle: { type: String, default: '' },
    solved: { type: Boolean, default: false },
  },
  { _id: false }
)

const InterviewSchema = new mongoose.Schema(
  {
    syncKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    interviewId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      default: 'sprint',
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    totalProblems: {
      type: Number,
      required: true,
    },
    solvedProblems: {
      type: Number,
      default: 0,
    },
    scorePercent: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    problems: [InterviewProblemSchema],
    startedAt: {
      type: Number,
      default: () => Date.now(),
    },
    completedAt: {
      type: Number,
      default: () => Date.now(),
    },
  },
  {
    timestamps: true,
  }
)

module.exports =
  mongoose.models.Interview || mongoose.model('Interview', InterviewSchema)
