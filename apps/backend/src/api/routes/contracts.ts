import { Router } from 'express'
import { contractRepo } from '../../repos/contractRepository'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const body = req.body
    const rec = await contractRepo.create(body)
    res.json(rec)
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const rec = await contractRepo.findById(id)
    if (!rec) return res.status(404).json({ error: 'not found' })
    res.json(rec)
  } catch (err) { next(err) }
})

router.post('/:id/deposits', async (req, res, next) => {
  try {
    const id = req.params.id
    const body = req.body
    const d = await contractRepo.addDeposit(id, body)
    await contractRepo.addAudit(id, { event: 'deposit_added', deposit: d })
    res.json(d)
  } catch (err) { next(err) }
})

router.get('/:id/deposits/pending', async (req, res, next) => {
  try {
    const deposits = await contractRepo.findPendingDeposits()
    res.json(deposits)
  } catch (err) { next(err) }
})

export default router
