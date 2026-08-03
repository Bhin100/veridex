import { z } from 'zod'
import process from 'process'

const baseSchema = z.object({
  NODE_ENV: z.enum(['development','production','test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16),
  SESSION_COOKIE_NAME: z.string().default('veridex.sid'),
  FOUNDER_EMAIL: z.string().email(),
  FOUNDER_PASSWORD: z.string().min(8),
  LOG_LEVEL: z.string().default('info'),
  SECRET_PROVIDER: z.enum(['env','vault']).default('env'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX: z.string().default('100'),
  TELEGRAM_MINIAPP_ORIGIN: z.string().url().optional(),
  SEED_DEV: z.string().optional()
})

const parsed = baseSchema.safeParse(process.env)

export type AppConfig = z.infer<typeof baseSchema>

export const config = {
  raw: process.env,
  parsed,
  validate: () => {
    if (!parsed.success) {
      const formatted = parsed.error.format()
      throw new Error('Environment validation error: ' + JSON.stringify(formatted, null, 2))
    }
  },
  get port() {
    return Number(process.env.PORT || 4000)
  },
  get isProd() {
    return process.env.NODE_ENV === 'production'
  }
}
