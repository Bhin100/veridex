import { Queue } from 'bullmq'

const redisUrl = process.env.REDIS_URL
const connection = redisUrl ? { connection: { url: redisUrl } } : { connection: undefined }

export const opportunityQueue = new Queue('opportunities', redisUrl ? { connection: { url: redisUrl } } : undefined)
