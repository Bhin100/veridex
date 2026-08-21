import express from 'express'
import { executionRepo } from '../../repos/executionRepository'
import { workerRegistry } from '../../services/workers/registry'
import { workerQueues } from '../../services/workers/queues'

const router = express.Router()

// Create Execution with tasks
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body
    const exec = await executionRepo.createExecution(payload)
    // if tasks provided, add them concurrently for higher throughput (O(1) vs O(N))
    if (Array.isArray(payload.tasks) && payload.tasks.length > 0) {
      await Promise.all(payload.tasks.map((t: any) => executionRepo.addTask(exec.id, t)))
    }
    res.status(201).json(exec)
  } catch (err) { next(err) }
})

// Cancel execution
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const id = req.params.id
    const updated = await executionRepo.cancelExecution(id)
    res.json(updated)
  } catch (err) { next(err) }
})

// Retry execution tasks
router.post('/:id/retry', async (req, res, next) => {
  try {
    const id = req.params.id
    // fetch execution
    // @ts-ignore
    const exec = await (await import('../../lib/db')).db.execution.findUnique({ where: { id }, include: { tasks: true } })
    if (!exec) return res.status(404).json({ error: 'not found' })
    const tasksToRetry = (exec.tasks || []).filter((t: any) => ['failed', 'cancelled'].includes(t.status))
    // Concurrently process retries to avoid sequential bottleneck during mass task retries
    await Promise.all(
      tasksToRetry.map(async (t: any) => {
        await executionRepo.updateTask(t.id, { status: 'pending' } as any)
        await workerQueues.pending.add('run', { taskId: t.id })
      })
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// Worker status
router.get('/workers', async (req, res, next) => {
  try {
    res.json(workerRegistry.list())
  } catch (err) { next(err) }
})

// Queue status
router.get('/queues', async (req, res, next) => {
  try {
    const qNames = Object.keys(workerQueues)
    const info: any = {}
    for (const n of qNames) {
      try {
        // @ts-ignore
        const q = workerQueues[n]
        // bullmq doesn't expose size without connection; provide placeholders
        info[n] = { name: n }
      } catch (e) {
        info[n] = { error: String(e) }
      }
    }
    res.json({ queues: info })
  } catch (err) { next(err) }
})

// Execution history
router.get('/:id/history', async (req, res, next) => {
  try {
    const id = req.params.id
    // @ts-ignore
    const logs = await (await import('../../lib/db')).db.taskLog.findMany({ where: { executionId: id }, orderBy: { createdAt: 'asc' } })
    res.json({ logs })
  } catch (err) { next(err) }
})

// Execution timeline
router.get('/:id/timeline', async (req, res, next) => {
  try {
    const id = req.params.id
    // @ts-ignore
    const exec = await (await import('../../lib/db')).db.execution.findUnique({ where: { id }, include: { tasks: true } })
    if (!exec) return res.status(404).json({ error: 'not found' })
    res.json({ execution: exec })
  } catch (err) { next(err) }
})

// Worker metrics
router.get('/metrics', async (req, res, next) => {
  try {
    // @ts-ignore
    const rows = await (await import('../../lib/db')).db.learningMetric.findMany({ where: { name: 'worker_metric' } })
    res.json({ metrics: rows })
  } catch (err) { next(err) }
})

export default router
