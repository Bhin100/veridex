import { Queue, Worker } from 'bullmq'

const redisUrl = process.env.REDIS_URL
const connection = redisUrl ? { connection: { url: redisUrl } } : undefined

export const queues = {
  discovered: new Queue('opportunities:discovered', connection),
  analysis: new Queue('opportunities:analysis', connection),
  high: new Queue('opportunities:high', connection),
  normal: new Queue('opportunities:normal', connection),
  low: new Queue('opportunities:low', connection),
  archived: new Queue('opportunities:archived', connection)
}

export function createAnalysisWorker(processFn: (job: any) => Promise<void>) {
  return new Worker('opportunities:analysis', async (job) => {
    await processFn(job)
  }, connection)
}
