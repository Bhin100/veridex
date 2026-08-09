import { Router } from 'express'
import { engagementRepo } from '../../repos/engagementRepository'

const router = Router()

router.get('/workspaces/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const rec = await (await import('../../lib/db')).db.engagement.findUnique({ where: { id } })
    if (!rec) return res.status(404).json({ error: 'not found' })
    res.json(rec)
  } catch (err) { next(err) }
})

router.get('/drafts/pending', async (req, res, next) => {
  try {
    const drafts = await engagementRepo.listPendingReviews()
    res.json(drafts)
  } catch (err) { next(err) }
})

export default router
