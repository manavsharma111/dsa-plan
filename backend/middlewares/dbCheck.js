import { connectDB, isDbConnected } from '../config/db.js'
import { APP_CONSTANTS } from '../config/constants.js'

export async function dbCheck(req, res, next) {
  try {
    if (!isDbConnected()) {
      await connectDB()
    }
    next()
  } catch (error) {
    console.error('[DB Check Middleware] Database unavailable:', error.message)
    return res.status(APP_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      error: 'Database connection unavailable',
      details: error.message,
    })
  }
}
