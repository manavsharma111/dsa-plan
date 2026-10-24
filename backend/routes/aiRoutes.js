import express from 'express'
import aiController from '../controllers/aiController.js'

const router = express.Router()

// POST /api/ai/review - Reviews DSA solution with Gemini AI
router.post('/review', aiController.review)

export default router
