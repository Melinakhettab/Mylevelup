import { env, validateEnv } from './src/config/env.js'
import app from './src/app.js'

validateEnv()

app.listen(env.PORT, () => {
  console.log(`
  ⚡ MY-LEVELUP API
  ─────────────────────────────
  🌐 http://localhost:${env.PORT}
  📡 Health: http://localhost:${env.PORT}/api/health
  🔑 Auth:   POST /api/auth/register
             POST /api/auth/login
             GET  /api/auth/me
  👤 Profile: POST /api/profile
              GET  /api/profile
              PATCH /api/profile
  ─────────────────────────────
  🏗️  Mode: ${env.NODE_ENV}
  `)
})
