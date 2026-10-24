import express from 'express'
import cors from 'cors'
import { ENV } from './config/env.js'
import { connectDB, disconnectDB, isDbConnected } from './config/db.js'
import { APP_CONSTANTS } from './config/constants.js'
import apiRoutes from './routes/apiRoutes.js'
import { dbCheck } from './middlewares/dbCheck.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { requestLogger } from './middlewares/requestLogger.js'

const app = express()
app.disable('x-powered-by')

// 1. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: ENV.CLIENT_ORIGIN === '*' ? true : ENV.CLIENT_ORIGIN,
    credentials: true,
  })
)

// 2. Request body parsing
app.use(express.json({ limit: APP_CONSTANTS.MAX_JSON_LIMIT }))
app.use(
  express.urlencoded({ extended: true, limit: APP_CONSTANTS.MAX_JSON_LIMIT })
)

// 3. Request logger (development & monitoring)
app.use(requestLogger)

// Root status endpoint for Render health checks and root pings
app.get(['/', '/healthz'], (req, res) => {
  res.json({
    status: 'online',
    service: 'DSA Tracker Backend API',
    database: isDbConnected() ? 'connected' : 'connecting',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  })
})

// 4. Database readiness middleware
app.use(dbCheck)

// 5. Mount API routes
app.use('/api', apiRoutes)

// 6. Handle unmatched routes (404)
app.use((req, res) => {
  res.status(APP_CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// 7. Centralized Global Error Handler
app.use(errorHandler)

// Server initialization & graceful shutdown
let server

async function startServer() {
  try {
    // Connect to database before listening
    await connectDB()

    server = app.listen(ENV.PORT, () => {
      console.log(
        `[DSA Backend] Production-ready server running on port ${ENV.PORT}`
      )
      console.log(
        `[DSA Backend] API Health: http://localhost:${ENV.PORT}/api/health`
      )
    })
  } catch (error) {
    console.error('[DSA Backend] Failed to start server:', error.message)
    process.exit(1)
  }
}

// Graceful shutdown handling
const handleGracefulShutdown = async (signal) => {
  console.log(
    `\n[DSA Backend] Received ${signal}. Starting graceful shutdown...`
  )
  if (server) {
    server.close(async () => {
      console.log('[DSA Backend] HTTP server closed.')
      await disconnectDB()
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
}

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'))
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'))

startServer()

export default app
