import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import apiRoutes from './routes/index.js'
import { AppError } from './utils/errors.js'
import { env } from './config/env.js'

const app = express()

// ─── Security & parsing ─────────────────────────────────────────────────────
app.use(helmet())
// En prod : accepte FRONTEND_URL + toujours railway.app en fallback
const allowedOrigins = env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      'https://my-levelup-production.up.railway.app',
      'https://my-levelup.up.railway.app',
    ].filter(Boolean) as string[]
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    // Autorise les requêtes sans origin (Postman, curl, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    // En prod, log le refus pour debug
    if (env.NODE_ENV === 'production') {
      console.warn(`⚠️ CORS refusé pour origin: ${origin}`)
    }
    callback(new Error(`CORS: origin ${origin} non autorisée`))
  },
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
