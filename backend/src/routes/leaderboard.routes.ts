import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getLeaderboard } from '../controllers/leaderboard.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(getLeaderboard))

export default router
