import { Router } from 'express'
import { generate, getCurrent, getHistory } from '../controllers/program.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(authMiddleware)

router.post('/generate', asyncHandler(generate))
router.get('/current', asyncHandler(getCurrent))
router.get('/history', asyncHandler(getHistory))

export default router
