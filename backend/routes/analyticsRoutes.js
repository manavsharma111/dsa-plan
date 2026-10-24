import express from 'express'
import analyticsController from '../controllers/analyticsController.js'

const router = express.Router()

// POST /api/analytics/patterns - Save pattern metrics matrix
router.post('/patterns', analyticsController.save)

// GET /api/analytics/patterns - Get pattern metrics matrix
router.get('/patterns', analyticsController.get)

export default router
