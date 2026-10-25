const express = require('express')
const readinessController = require('../controllers/readinessController')

const router = express.Router()

// GET /api/readiness - Calculate & return readiness report
router.get('/', readinessController.getReadiness)

// GET /api/readiness/history - Retrieve genuine historical snapshots
router.get('/history', readinessController.getHistory)

// POST /api/readiness/snapshot - Save a persistent historical snapshot
router.post('/snapshot', readinessController.saveSnapshot)

// POST /api/readiness/evaluate - In-memory calculation endpoint for client payloads
router.post('/evaluate', readinessController.evaluateRaw)

module.exports = router
