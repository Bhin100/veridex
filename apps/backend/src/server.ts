import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './lib/config'
import healthRouter from './routes/health'
import { errorHandler } from './middleware/errorHandler'
import { requestId } from './middleware/requestId'
import authRouter from './api/routes/auth'

export function createApp() {
  const app = express()
  app.use(requestId)
  app.use(helmet({
    contentSecurityPolicy: false
  }))
  app.use(express.json())
  app.use(cookieParser())

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX || 100)
  })
  app.use(limiter)

  app.use('/health', healthRouter)
  app.use('/api/v1/auth', authRouter)

  // versioned API placeholder mount point
  app.use('/api/v1', (req, res) => {
    res.status(404).json({ error: 'API route not implemented' })
  })

  app.use(errorHandler)
  return app
}
