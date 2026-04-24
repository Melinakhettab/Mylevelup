import { Request, Response } from 'express'
import {
  generateProgramForUser,
  getCurrentProgram,
  getProgramHistory,
} from '../services/program.service.js'

/**
 * POST /api/programs/generate
 * Generates a new AI-powered weekly sports program
 */
export async function generate(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const program = await generateProgramForUser(userId)

  res.status(201).json({
    success: true,
    data: program,
  })
}

/**
 * GET /api/programs/current
 * Returns the currently active program
 */
export async function getCurrent(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const program = await getCurrentProgram(userId)

  res.json({
    success: true,
    data: program,
  })
}

/**
 * GET /api/programs/history
 * Returns past programs
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const programs = await getProgramHistory(userId)

  res.json({
    success: true,
    data: programs,
  })
}
