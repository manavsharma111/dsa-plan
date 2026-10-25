const interviewService = require('../services/interviewService')
const { APP_CONSTANTS } = require('../config/constants')

class InterviewController {
  async save(req, res, next) {
    try {
      const { syncKey, interview } = req.body
      const saved = await interviewService.saveInterviewSession(
        syncKey,
        interview
      )
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        interview: saved,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAll(req, res, next) {
    try {
      const { syncKey, limit } = req.query
      const interviews = await interviewService.getUserInterviews(
        syncKey,
        limit
      )
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        interviews,
      })
    } catch (error) {
      next(error)
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params
      const { syncKey } = req.query
      const interview = await interviewService.getInterviewById(syncKey, id)
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        interview,
      })
    } catch (error) {
      next(error)
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params
      const { syncKey } = req.query
      const result = await interviewService.deleteInterview(syncKey, id)
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new InterviewController()
