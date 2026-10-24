import mongoose from 'mongoose'

const ProgressSchema = new mongoose.Schema(
  {
    syncKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    solved: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    mastery: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    revision: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastSyncTime: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Progress ||
  mongoose.model('Progress', ProgressSchema)
