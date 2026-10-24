import aiService from '../services/aiService.js'
import { APP_CONSTANTS } from '../config/constants.js'

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

export default new AiController()
