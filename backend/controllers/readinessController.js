const readinessService = require('../services/readinessService')
const readinessEngine = require('../services/readinessEngine')
const { APP_CONSTANTS } = require('../config/constants')

class ReadinessController {
  /**
   * GET /api/readiness?syncKey=xyz
   * Returns complete calculated readiness report from database
   */
  async getReadiness(req, res, next) {
    try {
      const { syncKey } = req.query
      const report = await readinessService.getReadinessReport(syncKey)
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        report,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/readiness/snapshot
   * Saves a persistent historical readiness snapshot
   */
  async saveSnapshot(req, res, next) {
    try {
      const { syncKey, report } = req.body
      const saved = await readinessService.saveSnapshot(syncKey, report)
      return res.status(APP_CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        snapshot: saved,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/readiness/history?syncKey=xyz&limit=20
   * Retrieves genuine historical score snapshots for trending
   */
  async getHistory(req, res, next) {
    try {
      const { syncKey, limit } = req.query
      const snapshots = await readinessService.getHistoricalSnapshots(syncKey, limit)
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        count: snapshots.length,
        snapshots,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/readiness/evaluate
   * Pure evaluation endpoint for calculating readiness from an in-memory client state
   */
  async evaluateRaw(req, res, next) {
    try {
      const { solved, mastery, revision, interviews, patternAnalytics, customWeights } = req.body
      const report = readinessEngine.calculateReport({
        solved: solved || {},
        mastery: mastery || {},
        revision: revision || {},
        interviews: Array.isArray(interviews) ? interviews : [],
        patternAnalytics: patternAnalytics || null,
        customWeights: customWeights || null,
      })
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        report,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ReadinessController()
