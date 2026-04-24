import { Router } from 'express'
import { completeSession, getSessions, getPoints } from '../controllers/session.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(authMiddleware)

router.get('/points', asyncHandler(getPoints))
router.post('/complete', asyncHandler(completeSession))
router.get('/', asyncHandler(getSessions))

export default router
