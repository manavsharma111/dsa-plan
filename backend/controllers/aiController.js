const aiService = require('../services/aiService')
const { APP_CONSTANTS } = require('../config/constants')

class AiController {
  async review(req, res, next) {
    try {
      const { problemTitle, patternTitle, difficulty, code, language } = req.body
      const review = await aiService.reviewSolution({
        problemTitle,
        patternTitle,
        difficulty,
        code,
        language,
      })
      return res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
        success: true,
        review,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AiController()
