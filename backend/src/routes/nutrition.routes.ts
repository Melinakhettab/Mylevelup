import { Router } from 'express'
import { generate, getCurrent } from '../controllers/nutrition.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(authMiddleware)

router.post('/generate', asyncHandler(generate))
router.get('/current', asyncHandler(getCurrent))

export default router
