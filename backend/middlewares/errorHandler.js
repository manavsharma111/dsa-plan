const { ENV } = require('../config/env')
const { APP_CONSTANTS } = require('../config/constants')

function errorHandler(err, req, res, next) {
  const statusCode =
    err.statusCode || APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR
  let message = err.message || 'Internal Server Error'

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message)
    message = `Validation Error: ${messages.join(', ')}`
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: message,
    })
  }

  // Handle Mongoose CastError (invalid ObjectId / parameter)
  if (err.name === 'CastError') {
    return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: `Invalid resource identifier: ${err.value}`,
    })
  }

  // Handle MongoDB Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(APP_CONSTANTS.HTTP_STATUS.CONFLICT).json({
      success: false,
      error: `Duplicate value entered for ${field}`,
    })
  }

  // Log error in non-test environments
  if (ENV.NODE_ENV !== 'test') {
    console.error(`[Error] [${req.method} ${req.originalUrl}]`, err)
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(!ENV.IS_PROD && { stack: err.stack }),
  })
}

module.exports = { errorHandler }
