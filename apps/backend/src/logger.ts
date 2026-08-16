import pino from 'pino'

const level = process.env.LOG_LEVEL || 'info'

export const logger = pino({
  level,
  mixin(_context, level) {
    return {
      service: 'veridex-backend',
      environment: process.env.NODE_ENV || 'development'
    }
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
})

export default logger
