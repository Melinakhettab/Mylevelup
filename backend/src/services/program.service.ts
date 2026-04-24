import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { NotFoundError } from '../utils/errors.js'
import { generateSportsProgram } from './ai/openai.service.js'
import type { ProfileContext } from './ai/prompts.js'

/**
 * Returns the Monday of the current week
 */
function getWeekStart(): Date {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * Generates a new program for the user:
 * 1. Loads the profile
 * 2. Deactivates any current program
 * 3. Calls the AI service
 * 4. Saves and returns the new program
 */
export async function generateProgramForUser(userId: number) {
  // Load profile
  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile) {
    throw new NotFoundError('Profil introuvable — complète d\'abord le questionnaire')
  }

  // Build context for the AI
  const context: ProfileContext = {
    firstName: profile.firstName || 'Utilisateur',
    age: profile.age,
    gender: profile.gender,
    weightKg: Number(profile.weightKg),
    heightCm: profile.heightCm,
    goal: profile.goal,
    fitnessLevel: profile.fitnessLevel,
    equipment: profile.equipment,
    weeklyAvailability: profile.weeklyAvailability,
    bmi: profile.bmi ? Number(profile.bmi) : null,
    bmr: profile.bmr,
    tdee: profile.tdee,
  }

  // Deactivate any currently active program
  await prisma.program.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  })

  // Generate via OpenAI
  const result = await generateSportsProgram(context)

  // Save to database
  const program = await prisma.program.create({
    data: {
      userId,
      weekStart: getWeekStart(),
      content: result.program as unknown as Prisma.InputJsonValue,
      isActive: true,
    },
  })

  return {
    id: program.id,
    weekStart: program.weekStart,
    isActive: program.isActive,
    createdAt: program.createdAt,
    program: result.program,
  }
}

/**
 * Returns the currently active program for the user
 */
export async function getCurrentProgram(userId: number) {
  const program = await prisma.program.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!program) {
    return null
  }

  return {
    id: program.id,
    weekStart: program.weekStart,
    isActive: program.isActive,
    createdAt: program.createdAt,
    program: program.content,
  }
}

/**
 * Returns past programs for the user
 */
export async function getProgramHistory(userId: number) {
  const programs = await prisma.program.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      weekStart: true,
      isActive: true,
      createdAt: true,
    },
  })

  return programs
}
