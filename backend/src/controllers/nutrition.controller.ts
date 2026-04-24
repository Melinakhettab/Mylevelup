import { Request, Response } from 'express'
import { generateNutritionForUser, getCurrentNutrition } from '../services/nutrition.service.js'

export async function generate(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const plan = await generateNutritionForUser(userId)

  res.status(201).json({
    success: true,
    data: plan,
  })
}

export async function getCurrent(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const plan = await getCurrentNutrition(userId)

  res.json({
    success: true,
    data: plan,
  })
}
