import { Router } from 'express'
import { z } from 'zod'
import { createProfile, getProfile, updateProfile } from '../controllers/profile.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// ─── Validation schemas ─────────────────────────────────────────────────────

const OBJECTIVES = ['perte_poids', 'prise_masse', 'remise_en_forme', 'maintien', 'performance'] as const
const LEVELS = ['debutant', 'intermediaire', 'avance'] as const
const EQUIPMENT = ['domicile', 'salle'] as const

const createProfileSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(50),
  age: z.number().int().min(10).max(120),
  gender: z.string().optional().default('non_specifie'),
  weight: z.number().min(20).max(300),
  height: z.number().int().min(100).max(250),
  objective: z.enum(OBJECTIVES),
  level: z.enum(LEVELS),
  equipment: z.enum(EQUIPMENT),
  dietary: z.array(z.string()).optional().default([]),
  hoursPerWeek: z.number().int().min(1).max(20),
})

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  age: z.number().int().min(10).max(120).optional(),
  gender: z.string().optional(),
  weight: z.number().min(20).max(300).optional(),
  height: z.number().int().min(100).max(250).optional(),
  objective: z.enum(OBJECTIVES).optional(),
  level: z.enum(LEVELS).optional(),
  equipment: z.enum(EQUIPMENT).optional(),
  dietary: z.array(z.string()).optional(),
  hoursPerWeek: z.number().int().min(1).max(20).optional(),
})

// ─── All routes require auth ────────────────────────────────────────────────

router.use(authMiddleware)

router.post('/', validate(createProfileSchema), asyncHandler(createProfile))
router.get('/', asyncHandler(getProfile))
router.patch('/', validate(updateProfileSchema), asyncHandler(updateProfile))

export default router
