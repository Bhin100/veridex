import { PrismaClient } from '@prisma/client'

// Ensure a single global PrismaClient instance in hot-reload/dev environments
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const prisma = global.__prisma ?? new PrismaClient()
if (!global.__prisma) global.__prisma = prisma

export { prisma as db }
