import express from 'express'
import syncRoutes from './syncRoutes.js'
import interviewRoutes from './interviewRoutes.js'
import analyticsRoutes from './analyticsRoutes.js'
import { isDbConnected } from '../config/db.js'

const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected() ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

// Feature routes
router.use('/sync', syncRoutes)
router.use('/interviews', interviewRoutes)
router.use('/analytics', analyticsRoutes)

export default router
