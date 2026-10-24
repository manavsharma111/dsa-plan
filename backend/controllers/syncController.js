import syncService from '../services/syncService.js'
import { APP_CONSTANTS } from '../config/constants.js'

class SyncController {
  async pull(req, res, next) {
    try {
      const { syncKey } = req.body
      const data = await syncService.pullUserProgress(syncKey)
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  async push(req, res, next) {
    try {
      const { syncKey, solved, mastery, revision } = req.body
      const result = await syncService.pushUserProgress(syncKey, {
        solved,
        mastery,
        revision,
      })
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json(result)
    } catch (error) {
      next(error)
    }
  }
}

export default new SyncController()
