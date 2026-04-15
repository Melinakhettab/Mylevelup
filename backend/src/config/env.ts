import dotenv from 'dotenv'
dotenv.config()

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
} as const

export function validateEnv(): void {
  if (!env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set — database features will fail')
  }
  if (env.JWT_SECRET === 'dev-secret-change-in-production' && env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production')
  }
}
