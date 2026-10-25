const analyticsService = require('../services/analyticsService')
const { APP_CONSTANTS } = require('../config/constants')

class AnalyticsController {
  async save(req, res, next) {
    try {
      const {
        syncKey,
        patterns,
        overallConfidence,
        highPriority,
        totalSolved,
        totalHints,
      } = req.body
      const saved = await analyticsService.savePatternAnalytics(syncKey, {
        patterns,
        overallConfidence,
        highPriority,
        totalSolved,
        totalHints,
      })
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        analytics: saved,
      })
    } catch (error) {
      next(error)
    }
  }

  async get(req, res, next) {
    try {
      const { syncKey } = req.query
      const analytics = await analyticsService.getPatternAnalytics(syncKey)
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        analytics,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AnalyticsController()
