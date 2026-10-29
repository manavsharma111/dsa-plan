const { connectDB, isDbConnected } = require('../config/db')
const { APP_CONSTANTS } = require('../config/constants')

async function dbCheck(req, res, next) {
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
      details:
        process.env.NODE_ENV === 'production'
          ? 'Service temporarily unavailable'
          : error.message,
    })
  }
}

module.exports = { dbCheck }
