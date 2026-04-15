import { Router } from 'express'
import { z } from 'zod'
import { register, login, getMe } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// ─── Validation schemas ─────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

// ─── Routes ─────────────────────────────────────────────────────────────────

router.post('/register', validate(registerSchema), asyncHandler(register))
router.post('/login', validate(loginSchema), asyncHandler(login))
router.get('/me', authMiddleware, asyncHandler(getMe))

export default router
