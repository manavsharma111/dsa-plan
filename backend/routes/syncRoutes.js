import express from 'express'
import syncController from '../controllers/syncController.js'

const router = express.Router()

// POST /api/sync/pull - Pull user progress, interviews, analytics
router.post('/pull', syncController.pull)

// POST /api/sync/push - Push solved, mastery, and revision progress
router.post('/push', syncController.push)

// POST /api/sync/extension-submission - Auto capture from Chrome extension
router.post('/extension-submission', syncController.extensionSubmission)

export default router
