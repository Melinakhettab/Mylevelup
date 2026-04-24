import { Router } from 'express'
import authRoutes from './auth.routes.js'
import profileRoutes from './profile.routes.js'
import programRoutes from './program.routes.js'
import sessionRoutes from './session.routes.js'
import nutritionRoutes from './nutrition.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/profile', profileRoutes)
router.use('/programs', programRoutes)
router.use('/sessions', sessionRoutes)
router.use('/nutrition', nutritionRoutes)

export default router
