import PatternAnalytics from '../models/PatternAnalytics.js'
import { APP_CONSTANTS } from '../config/constants.js'

class AnalyticsService {
  /**
   * Save or update pattern analytics matrix for user
   * @param {string} syncKey
   * @param {object} payload
   */
  async savePatternAnalytics(syncKey, payload = {}) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const {
      patterns = [],
      overallConfidence = 0,
      highPriority = [],
      totalSolved = 0,
      totalHints = 0,
    } = payload

    const cleanKey = syncKey.trim().toLowerCase()

    const saved = await PatternAnalytics.findOneAndUpdate(
      { syncKey: cleanKey },
      {
        $set: {
          syncKey: cleanKey,
          overallConfidence: Number(overallConfidence) || 0,
          totalSolved: Number(totalSolved) || 0,
          totalHints: Number(totalHints) || 0,
          highPriority: Array.isArray(highPriority) ? highPriority : [],
          patterns: Array.isArray(patterns) ? patterns : [],
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )

    return saved
  }

  /**
   * Get pattern analytics matrix for user
   * @param {string} syncKey
   */
  async getPatternAnalytics(syncKey) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey query parameter is required')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()
    const analytics = await PatternAnalytics.findOne({
      syncKey: cleanKey,
    }).lean()

    return analytics || null
  }
}

export default new AnalyticsService()
