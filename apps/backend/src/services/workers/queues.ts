import { Queue, Worker } from 'bullmq'

const redisUrl = process.env.REDIS_URL
const connection = redisUrl ? { connection: { url: redisUrl } } : undefined

export const workerQueues = {
  pending: new Queue('workers:pending', connection),
  running: new Queue('workers:running', connection),
  waiting: new Queue('workers:waiting', connection),
  retry: new Queue('workers:retry', connection),
  completed: new Queue('workers:completed', connection),
  failed: new Queue('workers:failed', connection),
  cancelled: new Queue('workers:cancelled', connection)
}

export function createWorker(processFn: (job: any) => Promise<void>, queueName = 'workers:pending') {
  return new Worker(queueName, async (job) => {
    await processFn(job)
  }, connection)
}
