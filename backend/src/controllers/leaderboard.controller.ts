import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'

export async function getLeaderboard(req: Request, res: Response) {
  const userId = (req as unknown as { user: { id: number } }).user.id

  const top = await prisma.points.findMany({
    orderBy: { total: 'desc' },
    take: 20,
    include: {
      user: {
        include: { profile: true },
      },
    },
  })

  const topMapped = top.map((entry: typeof top[0], index: number) => ({
    rank: index + 1,
    userId: entry.userId,
    firstName: entry.user.profile?.firstName ?? 'Anonyme',
    total: entry.total,
    streak: entry.streak,
  }))

  const myPoints = await prisma.points.findUnique({ where: { userId } })

  let me = { rank: 0, userId, firstName: 'Toi', total: 0, streak: 0 }

  if (myPoints) {
    const countAbove = await prisma.points.count({
      where: { total: { gt: myPoints.total } },
    })
    const myProfile = await prisma.profile.findUnique({ where: { userId } })
    me = {
      rank: countAbove + 1,
      userId,
      firstName: myProfile?.firstName ?? 'Toi',
      total: myPoints.total,
      streak: myPoints.streak,
    }
  }

  res.json({ success: true, data: { top: topMapped, me } })
}
