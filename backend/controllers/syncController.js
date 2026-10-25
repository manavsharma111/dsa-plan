const syncService = require('../services/syncService')
const { APP_CONSTANTS } = require('../config/constants')

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

  async extensionSubmission(req, res, next) {
    try {
      const result = await syncService.handleExtensionSubmission(req.body)
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json(result)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new SyncController()
