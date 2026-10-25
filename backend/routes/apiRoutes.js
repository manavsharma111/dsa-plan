const express = require('express')
const syncRoutes = require('./syncRoutes')
const interviewRoutes = require('./interviewRoutes')
const analyticsRoutes = require('./analyticsRoutes')
const aiRoutes = require('./aiRoutes')
const readinessRoutes = require('./readinessRoutes')
const { isDbConnected } = require('../config/db')

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
router.use('/ai', aiRoutes)
router.use('/readiness', readinessRoutes)

module.exports = router
