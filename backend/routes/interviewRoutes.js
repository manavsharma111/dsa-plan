import express from 'express'
import interviewController from '../controllers/interviewController.js'

const router = express.Router()

// POST /api/interviews - Save or update interview session
router.post('/', interviewController.save)

// GET /api/interviews - Get all interview sessions for user
router.get('/', interviewController.getAll)

// GET /api/interviews/:id - Get specific interview analysis by id
router.get('/:id', interviewController.getById)

// DELETE /api/interviews/:id - Delete interview session by id
router.delete('/:id', interviewController.remove)

export default router
