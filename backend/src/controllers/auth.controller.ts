import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../config/prisma.js'
import { generateToken } from '../middlewares/auth.middleware.js'
import { ConflictError, UnauthorizedError } from '../utils/errors.js'

const SALT_ROUNDS = 12

/**
 * POST /api/auth/register
 * Creates a new user and returns a JWT
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError('Un compte avec cet email existe déjà')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  // Create user
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  })

  // Generate JWT
  const token = generateToken({ userId: user.id, email: user.email })

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    },
  })
}

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body

  // Find user
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new UnauthorizedError('Email ou mot de passe incorrect')
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    throw new UnauthorizedError('Email ou mot de passe incorrect')
  }

  // Generate JWT
  const token = generateToken({ userId: user.id, email: user.email })

  // Check if profile exists
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      hasProfile: !!profile,
    },
  })
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { profile: true, points: true },
  })

  if (!user) {
    throw new UnauthorizedError('Utilisateur introuvable')
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      profile: user.profile,
      points: user.points,
    },
  })
}
