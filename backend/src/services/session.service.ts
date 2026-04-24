import { prisma } from '../config/prisma.js'

const POINTS_PER_SESSION = 50

function todayDate(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function yesterdayDate(): Date {
  const d = todayDate()
  d.setDate(d.getDate() - 1)
  return d
}

export async function completeSessionForUser(
  userId: number,
  programId: number,
  dayNumber: number,
  durationMin?: number,
  feeling?: string,
) {
  const today = todayDate()

  // Create session log
  const sessionLog = await prisma.sessionLog.create({
    data: {
      userId,
      programId,
      sessionDate: today,
      durationMin: durationMin ?? null,
      feeling: feeling ?? null,
      notes: `Jour ${dayNumber}`,
      completed: true,
    },
  })

  // Determine new streak
  const lastSession = await prisma.sessionLog.findFirst({
    where: {
      userId,
      completed: true,
      id: { not: sessionLog.id },
    },
    orderBy: { sessionDate: 'desc' },
  })

  let newStreak = 1
  if (lastSession) {
    const lastDate = new Date(lastSession.sessionDate)
    lastDate.setHours(0, 0, 0, 0)
    const yesterday = yesterdayDate()
    if (lastDate.getTime() === yesterday.getTime()) {
      // Last session was yesterday: increment streak
      const existing = await prisma.points.findUnique({ where: { userId } })
      newStreak = (existing?.streak ?? 0) + 1
    }
  }

  // Upsert points record
  const pointsRecord = await prisma.points.upsert({
    where: { userId },
    update: {
      total: { increment: POINTS_PER_SESSION },
      streak: newStreak,
    },
    create: {
      userId,
      total: POINTS_PER_SESSION,
      streak: newStreak,
    },
  })

  // Create point transaction
  const transaction = await prisma.pointTransaction.create({
    data: {
      userId,
      amount: POINTS_PER_SESSION,
      reason: `Séance complétée — Jour ${dayNumber}`,
    },
  })

  return {
    points: pointsRecord.total,
    streak: pointsRecord.streak,
    transaction: {
      id: transaction.id,
      amount: transaction.amount,
      reason: transaction.reason,
      createdAt: transaction.createdAt,
    },
  }
}

export async function getSessionsForUser(userId: number) {
  const sessions = await prisma.sessionLog.findMany({
    where: { userId, completed: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      programId: true,
      sessionDate: true,
      durationMin: true,
      feeling: true,
      notes: true,
      completed: true,
      createdAt: true,
    },
  })
  return sessions
}

export async function getPointsForUser(userId: number) {
  const pointsRecord = await prisma.points.findUnique({ where: { userId } })
  return {
    total: pointsRecord?.total ?? 0,
    streak: pointsRecord?.streak ?? 0,
  }
}
