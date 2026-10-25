const Interview = require('../models/Interview')
const { APP_CONSTANTS } = require('../config/constants')

class InterviewService {
  async saveInterviewSession(syncKey, interview) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }
    if (!interview || typeof interview !== 'object') {
      const err = new Error('interview payload is required')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()
    const interviewId = interview.id ? String(interview.id) : String(Date.now())

    const totalProblems =
      interview.totalProblems ||
      (Array.isArray(interview.problems) ? interview.problems.length : 0)
    const solvedProblems =
      interview.solvedProblems ||
      (Array.isArray(interview.problems)
        ? interview.problems.filter((p) => p.solved).length
        : 0)

    const scorePercent =
      interview.scorePercent !== undefined
        ? interview.scorePercent
        : totalProblems > 0
          ? Math.round((solvedProblems / totalProblems) * 100)
          : 0

    const record = await Interview.findOneAndUpdate(
      { syncKey: cleanKey, interviewId },
      {
        $set: {
          syncKey: cleanKey,
          interviewId,
          title: interview.title || 'Mock Interview',
          format: interview.format || 'custom',
          durationMinutes: interview.durationMinutes || 60,
          timeTakenSeconds: interview.timeTakenSeconds || 0,
          totalProblems,
          solvedProblems,
          scorePercent,
          notes: interview.notes || '',
          problems: Array.isArray(interview.problems) ? interview.problems : [],
          startedAt: interview.startedAt || Date.now(),
          completedAt: interview.completedAt || Date.now(),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )

    return record
  }

  async getUserInterviews(syncKey, limit = APP_CONSTANTS.MAX_HISTORY_LIMIT) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey query parameter is required')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()
    const interviews = await Interview.find({ syncKey: cleanKey })
      .sort({ startedAt: -1 })
      .limit(Number(limit) || APP_CONSTANTS.MAX_HISTORY_LIMIT)
      .lean()

    return interviews
  }

  async getInterviewById(syncKey, interviewId) {
    if (!interviewId) {
      const err = new Error('interviewId is required')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const query = { interviewId: String(interviewId) }
    if (syncKey) {
      query.syncKey = String(syncKey).trim().toLowerCase()
    }

    const item = await Interview.findOne(query).lean()
    if (!item) {
      const err = new Error('Interview record not found')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.NOT_FOUND
      throw err
    }

    return item
  }

  async deleteInterview(syncKey, interviewId) {
    if (!interviewId) {
      const err = new Error('interviewId is required')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const query = { interviewId: String(interviewId) }
    if (syncKey) {
      query.syncKey = String(syncKey).trim().toLowerCase()
    }

    const deleted = await Interview.findOneAndDelete(query)
    if (!deleted) {
      const err = new Error('Interview record not found or already deleted')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.NOT_FOUND
      throw err
    }

    return { message: 'Interview record successfully deleted', interviewId }
  }
}

module.exports = new InterviewService()
