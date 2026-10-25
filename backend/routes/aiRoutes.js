const express = require('express')
const aiController = require('../controllers/aiController')

const router = express.Router()

// POST /api/ai/review - Reviews DSA solution with Gemini AI
router.post('/review', aiController.review)

module.exports = router
