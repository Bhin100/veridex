import { Queue, Worker } from 'bullmq'
import { engagementRepo } from '../../repos/engagementRepository'

const redisUrl = process.env.REDIS_URL
const connection = redisUrl ? { connection: { url: redisUrl } } : undefined

export const engagementQueues = {
  founderReview: new Queue('engagements:founder_review', connection),
  drafts: new Queue('engagements:drafts', connection),
  recent: new Queue('engagements:recent', connection)
}

export function createEngagementWorker(processFn: (job: any) => Promise<void>) {
  return new Worker('opportunities:high', async (job) => {
    await processFn(job)
  }, connection)
}
