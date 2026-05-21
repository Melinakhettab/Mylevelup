import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import apiRoutes from './routes/index.js'
import { AppError } from './utils/errors.js'
import { env } from './config/env.js'

const app = express()

// ─── Security & parsing ─────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || true)
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── API routes ─────────────────────────────────────────────────────────────
app.use('/api', apiRoutes)

// ─── 404 catch-all ──────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route introuvable' })
})

// ─── Global error handler ───────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Always log errors so Railway captures them
  console.error('❌ Error:', err.message)
  if (!(err instanceof AppError)) {
    console.error(err.stack)
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
    return
  }

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      error: 'Erreur de base de données',
    })
    return
  }

  // Unexpected error
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur'
      : err.message,
  })
})

export default app
