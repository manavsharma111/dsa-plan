import Progress from '../models/Progress.js'
import Interview from '../models/Interview.js'
import PatternAnalytics from '../models/PatternAnalytics.js'
import { APP_CONSTANTS } from '../config/constants.js'

class SyncService {
  /**
   * Pulls all user progress, recent interviews, and pattern analytics for a given sync key
   * @param {string} syncKey
   */
  async pullUserProgress(syncKey) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()

    // 1. Fetch or initialize progress record
    let progress = await Progress.findOne({ syncKey: cleanKey })
    if (!progress) {
      progress = await Progress.create({
        syncKey: cleanKey,
        solved: {},
        mastery: {},
        revision: {},
        lastSyncTime: new Date().toISOString(),
      })
    }

    // 2. Fetch interviews history (newest first, up to max limit)
    const interviews = await Interview.find({ syncKey: cleanKey })
      .sort({ startedAt: -1 })
      .limit(APP_CONSTANTS.MAX_HISTORY_LIMIT)
      .lean()

    // 3. Fetch pattern analytics
    const analytics = await PatternAnalytics.findOne({
      syncKey: cleanKey,
    }).lean()

    return {
      syncKey: cleanKey,
      solved: progress.solved || {},
      mastery: progress.mastery || {},
      revision: progress.revision || {},
      lastSyncTime: progress.lastSyncTime || progress.updatedAt,
      interviews: interviews || [],
      patternAnalytics: analytics || null,
    }
  }

  /**
   * Pushes/upserts solved, mastery, and revision data for a user
   * @param {string} syncKey
   * @param {{ solved: object, mastery: object, revision: object }} payload
   */
  async pushUserProgress(
    syncKey,
    { solved = {}, mastery = {}, revision = {} }
  ) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const updated = await Progress.findOneAndUpdate(
      { syncKey: cleanKey },
      {
        $set: {
          solved: solved || {},
          mastery: mastery || {},
          revision: revision || {},
          lastSyncTime: nowTime,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )

    return {
      success: true,
      syncKey: cleanKey,
      lastSyncTime: nowTime,
      updatedAt: updated.updatedAt,
    }
  }
}

export default new SyncService()
