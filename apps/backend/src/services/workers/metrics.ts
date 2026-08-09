import { db } from '../../lib/db'

export async function recordWorkerMetric(workerId: string, metric: string, value: any) {
  try {
    // @ts-ignore
    return await db.learningMetric.upsert({ where: { key: `worker_metric:${workerId}:${metric}` }, update: { name: 'worker_metric', value: { value, ts: new Date().toISOString() }, computedAt: new Date() } as any, create: { name: 'worker_metric', key: `worker_metric:${workerId}:${metric}`, value: { value, ts: new Date().toISOString() } as any } })
  } catch (err) {
    try {
      // @ts-ignore
      await db.$queryRawUnsafe(`INSERT INTO "LearningMetric" (id, name, key, value, "computedAt") VALUES ($1,$2,$3,$4, now()) ON CONFLICT (key) DO UPDATE SET value = $4, "computedAt" = now()`, require('crypto').randomUUID(), 'worker_metric', `worker_metric:${workerId}:${metric}`, JSON.stringify({ value, ts: new Date().toISOString() }))
    } catch (e) { /* swallow */ }
  }
}

export async function collectQueueMetrics() {
  const queues = ['workers:pending','workers:running','workers:waiting','workers:retry','workers:completed','workers:failed','workers:cancelled']
  const sizes: any = {}
  for (const q of queues) {
    // bullmq Queue.getJobCounts requires connection; fallback to 0
    sizes[q] = 0
  }
  // persist aggregate
  await recordWorkerMetric('system','queue_sizes', sizes)
}
