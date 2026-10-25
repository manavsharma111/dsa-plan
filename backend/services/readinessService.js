const Progress = require('../models/Progress')
const Interview = require('../models/Interview')
const PatternAnalytics = require('../models/PatternAnalytics')
const ReadinessSnapshot = require('../models/ReadinessSnapshot')
const readinessEngine = require('./readinessEngine')
const { APP_CONSTANTS } = require('../config/constants')

class ReadinessService {
  /**
   * Calculate readiness report for a user based on current database state
   * @param {string} syncKey
   * @param {Object} [options]
   */
  async getReadinessReport(syncKey, options = {}) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey query parameter is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()

    // 1. Fetch user progress
    const progress = await Progress.findOne({ syncKey: cleanKey }).lean()

    // 2. Fetch interviews history
    const interviews = await Interview.find({ syncKey: cleanKey })
      .sort({ startedAt: -1 })
      .limit(APP_CONSTANTS.MAX_HISTORY_LIMIT)
      .lean()

    // 3. Fetch pattern analytics
    const patternAnalytics = await PatternAnalytics.findOne({ syncKey: cleanKey }).lean()

    // 4. Calculate report using pure readiness engine
    const report = readinessEngine.calculateReport({
      solved: progress?.solved || {},
      mastery: progress?.mastery || {},
      revision: progress?.revision || {},
      interviews: interviews || [],
      patternAnalytics,
      now: options.now || Date.now(),
      customWeights: options.customWeights || null,
    })

    return {
      syncKey: cleanKey,
      ...report,
    }
  }

  /**
   * Persist a historical readiness snapshot for trend tracking
   * @param {string} syncKey
   * @param {Object} [reportPayload]
   */
  async saveSnapshot(syncKey, reportPayload = null) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()

    // If report is not passed in, calculate it
    const report = reportPayload || (await this.getReadinessReport(cleanKey))

    // Throttle duplicate snapshots: if a snapshot was recorded in last 3 minutes with identical score, reuse
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)
    const recent = await ReadinessSnapshot.findOne({
      syncKey: cleanKey,
      calculatedAt: { $gte: threeMinutesAgo },
    }).sort({ calculatedAt: -1 })

    if (recent && recent.overallScore === report.overallScore && recent.status === report.status) {
      return recent
    }

    const snapshot = await ReadinessSnapshot.create({
      syncKey: cleanKey,
      overallScore: report.overallScore,
      status: report.status,
      confidenceLevel: report.confidenceLevel,
      evidenceCoverage: report.evidenceCoverage,
      scoreExplanation: report.scoreExplanation,
      components: report.components,
      metrics: report.metrics,
      strongestPatterns: report.strongestPatterns,
      weakestPatterns: report.weakestPatterns,
      insufficientEvidencePatterns: report.insufficientEvidencePatterns,
      recommendations: report.recommendations,
      calculatedAt: new Date(),
    })

    // Cap historical snapshots to max 50 per user
    const totalCount = await ReadinessSnapshot.countDocuments({ syncKey: cleanKey })
    if (totalCount > 50) {
      const oldest = await ReadinessSnapshot.find({ syncKey: cleanKey })
        .sort({ calculatedAt: 1 })
        .limit(totalCount - 50)
      const idsToDelete = oldest.map((d) => d._id)
      await ReadinessSnapshot.deleteMany({ _id: { $in: idsToDelete } })
    }

    return snapshot
  }

  /**
   * Retrieve genuine historical snapshots for score trend graphing
   * @param {string} syncKey
   * @param {number} [limit=20]
   */
  async getHistoricalSnapshots(syncKey, limit = 20) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey query parameter is required')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()
    const snapshots = await ReadinessSnapshot.find({ syncKey: cleanKey })
      .sort({ calculatedAt: 1 }) // Chronological ascending for trend display
      .limit(Number(limit) || 20)
      .lean()

    return snapshots
  }
}

module.exports = new ReadinessService()
