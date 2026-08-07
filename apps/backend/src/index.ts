import { createApp } from './server'
import { config } from './lib/config'
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  mixin() {
    return { service: 'veridex-backend', environment: process.env.NODE_ENV || 'production' }
  }
})

const app = createApp()
const port = config.port

app.listen(port, () => {
  logger.info(`VERIDEX Express Backend started successfully on port ${port}`)
})
