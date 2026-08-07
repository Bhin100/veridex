import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './lib/config'
import healthRouter from './routes/health'
import { errorHandler } from './middleware/errorHandler'
import { requestId } from './middleware/requestId'
import authRouter from './api/routes/auth'
import opportunitiesRouter from './api/routes/opportunities'
import approvalRouter from './api/routes/approval'
import contractsRouter from './api/routes/contracts'
import engagementsRouter from './api/routes/engagements'
import learningRouter from './api/routes/learning'
import paymentSettingsRouter from './api/routes/payment_settings'
import registerWorkerRoutes from './api/workers.register'

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
  app.use('/api/v1/opportunities', opportunitiesRouter)
  app.use('/api/v1/approval', approvalRouter)
  app.use('/api/v1/contracts', contractsRouter)
  app.use('/api/v1/engagements', engagementsRouter)
  app.use('/api/v1/learning', learningRouter)
  app.use('/api/v1/payment-settings', paymentSettingsRouter)

  // Register worker API routes (worker metrics and controls)
  registerWorkerRoutes(app)

  // versioned API placeholder mount point fallback
  app.use('/api/v1', (req, res) => {
    res.status(404).json({ error: 'API route not implemented' })
  })

  app.use(errorHandler)
  return app
}
