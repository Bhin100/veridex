import express from 'express'
import { executionRepo } from '../../repos/executionRepository'
import { workerRegistry } from '../../services/workers/registry'

const router = express.Router()

router.post('/executions', async (req, res, next) => {
  try {
    const exec = req.body
    const created = await executionRepo.createExecution(exec)
    res.json(created)
  } catch (err) { next(err) }
})

router.post('/executions/:id/cancel', async (req, res, next) => {
  try {
    const id = req.params.id
    // mark execution cancelled
    // @ts-ignore
    const updated = await (await import('../../lib/db')).db.execution.update({ where: { id }, data: { status: 'cancelled' } })
    res.json(updated)
  } catch (err) { next(err) }
})

router.get('/workers', async (req, res, next) => {
  try {
    res.json(workerRegistry.list())
  } catch (err) { next(err) }
})

export default router
