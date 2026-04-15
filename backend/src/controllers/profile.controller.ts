import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { ConflictError, NotFoundError } from '../utils/errors.js'
import { calculateBMI, calculateBMR, calculateTDEE } from '../utils/health.js'

/**
 * POST /api/profile
 * Creates the user's profile after onboarding
 */
export async function createProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId

  // Check if profile already exists
  const existing = await prisma.profile.findUnique({ where: { userId } })
  if (existing) {
    throw new ConflictError('Le profil existe déjà — utilise PATCH pour le modifier')
  }

  const {
    firstName,
    age,
    gender = 'non_specifie',
    weight,
    height,
    objective,
    level,
    equipment,
    dietary = [],
    hoursPerWeek,
  } = req.body

  // Calculate health metrics
  const bmi = calculateBMI(weight, height)
  const bmr = calculateBMR(weight, height, age, gender)
  const tdee = calculateTDEE(bmr, hoursPerWeek)

  const profile = await prisma.profile.create({
    data: {
      userId,
      firstName,
      age,
      gender,
      heightCm: height,
      weightKg: weight,
      goal: objective,
      fitnessLevel: level,
      weeklyAvailability: hoursPerWeek,
      equipment,
      dietaryRestrictions: dietary,
      bmi,
      bmr,
      tdee,
    },
  })

  // Initialize points for this user
  await prisma.points.upsert({
    where: { userId },
    create: { userId, total: 0, streak: 0 },
    update: {},
  })

  // Record initial weight
  await prisma.weightHistory.create({
    data: { userId, weightKg: weight },
  })

  res.status(201).json({
    success: true,
    data: profile,
  })
}

/**
 * GET /api/profile
 * Returns the authenticated user's profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId

  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile) {
    throw new NotFoundError('Profil introuvable — complète le questionnaire d\'abord')
  }

  res.json({
    success: true,
    data: profile,
  })
}

/**
 * PATCH /api/profile
 * Updates the authenticated user's profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId

  const existing = await prisma.profile.findUnique({ where: { userId } })
  if (!existing) {
    throw new NotFoundError('Profil introuvable')
  }

  const {
    firstName,
    age,
    gender,
    weight,
    height,
    objective,
    level,
    equipment,
    dietary,
    hoursPerWeek,
  } = req.body

  // Build update data (only include provided fields)
  const updateData: Record<string, unknown> = {}
  if (firstName !== undefined) updateData.firstName = firstName
  if (age !== undefined) updateData.age = age
  if (gender !== undefined) updateData.gender = gender
  if (weight !== undefined) updateData.weightKg = weight
  if (height !== undefined) updateData.heightCm = height
  if (objective !== undefined) updateData.goal = objective
  if (level !== undefined) updateData.fitnessLevel = level
  if (equipment !== undefined) updateData.equipment = equipment
  if (dietary !== undefined) updateData.dietaryRestrictions = dietary
  if (hoursPerWeek !== undefined) updateData.weeklyAvailability = hoursPerWeek

  // Recalculate health metrics if relevant fields changed
  const finalWeight = weight ?? Number(existing.weightKg)
  const finalHeight = height ?? existing.heightCm
  const finalAge = age ?? existing.age
  const finalGender = gender ?? existing.gender
  const finalHours = hoursPerWeek ?? existing.weeklyAvailability

  updateData.bmi = calculateBMI(finalWeight, finalHeight)
  updateData.bmr = calculateBMR(finalWeight, finalHeight, finalAge, finalGender)
  updateData.tdee = calculateTDEE(updateData.bmr as number, finalHours)

  const profile = await prisma.profile.update({
    where: { userId },
    data: updateData,
  })

  // Record new weight if changed
  if (weight !== undefined && weight !== Number(existing.weightKg)) {
    await prisma.weightHistory.create({
      data: { userId, weightKg: weight },
    })
  }

  res.json({
    success: true,
    data: profile,
  })
}
