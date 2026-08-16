import express from 'express'
import { executionRepo } from '../../repos/executionRepository'
import { workerRegistry } from '../../services/workers/registry'

const router = express.Router()

router.get('/status', async (req, res, next) => {
  try {
    const list = workerRegistry.list()
    res.json({ workers: list })
  } catch (err) { next(err) }
})

router.get('/queues', async (req, res, next) => {
  try {
    // expose queue sizes if available
    res.json({ queues: ['pending','running','waiting','retry','completed','failed','cancelled'] })
  } catch (err) { next(err) }
})

router.post('/executions/:id/retry', async (req, res, next) => {
  try {
    const id = req.params.id
    // fetch execution tasks and requeue pending/failed tasks
    // @ts-ignore
    const exec = await (await import('../../lib/db')).db.execution.findUnique({ where: { id }, include: { tasks: true } })
    if (!exec) return res.status(404).json({ error: 'not found' })
    for (const t of exec.tasks || []) {
      if (['failed','cancelled'].includes(t.status)) {
        await (await import('../../services/workers/manager')).workerManager.scheduleTask(t)
      }
    }
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
