import analyticsService from '../services/analyticsService.js'
import { APP_CONSTANTS } from '../config/constants.js'

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

export default new AnalyticsController()
