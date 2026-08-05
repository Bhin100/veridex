import { Queue } from 'bullmq'
import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL
const connection = redisUrl ? new Redis(redisUrl, { maxRetriesPerRequest: null }) : undefined

export const opportunityQueue = new Queue('opportunities', { connection })
