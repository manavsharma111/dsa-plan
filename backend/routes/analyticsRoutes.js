const express = require('express')
const analyticsController = require('../controllers/analyticsController')

const router = express.Router()

// POST /api/analytics/patterns - Save pattern metrics matrix
router.post('/patterns', analyticsController.save)

// GET /api/analytics/patterns - Get pattern metrics matrix
router.get('/patterns', analyticsController.get)

module.exports = router
