import express from 'express'
import { db } from '../../lib/db'
import { computeWinRate, computeAverageRevenue, computeAvgResponseTime, computeROIBySource } from '../../services/learning/engine'
import { recommendForOpportunity } from '../../services/learning/recommender'

const router = express.Router()

router.get('/stats', async (req, res, next) => {
  try {
    const win = await computeWinRate()
    const revenue = await computeAverageRevenue()
    const resp = await computeAvgResponseTime()
    res.json({ win, revenue, resp })
  } catch (err) { next(err) }
})

router.get('/roi-by-source', async (req, res, next) => {
  try {
    const r = await computeROIBySource()
    res.json(r)
  } catch (err) { next(err) }
})

router.get('/recommend/:opportunityId', async (req, res, next) => {
  try {
    const oppId = req.params.opportunityId
    // fetch opportunity from DB
    const opp = await db.opportunity.findUnique({ where: { id: oppId } }).catch(() => null)
    if (!opp) return res.status(404).json({ error: 'opportunity not found' })
    const recs = await recommendForOpportunity(opp)
    res.json(recs)
  } catch (err) { next(err) }
})

export default router
