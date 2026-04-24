import { Request, Response } from 'express'
import { completeSessionForUser, getSessionsForUser, getPointsForUser } from '../services/session.service.js'
import { BadRequestError } from '../utils/errors.js'

export async function completeSession(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const { programId, dayNumber, durationMin, feeling } = req.body as {
    programId: number
    dayNumber: number
    durationMin?: number
    feeling?: string
  }

  if (!programId || !dayNumber) {
    throw new BadRequestError('programId et dayNumber sont requis')
  }

  const result = await completeSessionForUser(
    userId,
    Number(programId),
    Number(dayNumber),
    durationMin ? Number(durationMin) : undefined,
    feeling,
  )

  res.status(201).json({ success: true, data: result })
}

export async function getSessions(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const sessions = await getSessionsForUser(userId)
  res.json({ success: true, data: sessions })
}

export async function getPoints(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId
  const points = await getPointsForUser(userId)
  res.json({ success: true, data: points })
}
