import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const client = new PrismaClient()

export async function connectDatabase() {
  try {
    await client.$connect()
    logger.info('Connected to database')
  } catch (err) {
    logger.error({ err }, 'Database connection failed')
    throw err
  }
}

export async function disconnectDatabase() {
  try {
    await client.$disconnect()
    logger.info('Disconnected database')
  } catch (err) {
    logger.error({ err }, 'Database disconnect error')
  }
}

export { client as db }
