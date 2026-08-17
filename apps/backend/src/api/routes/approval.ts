import { evaluateOpportunity } from '../../services/approval/engine'
import { approvalRepository } from '../../repos/approvalRepository'
import express from 'express'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    // list recent decisions
    // @ts-ignore
    const decisions = await (await import('../../lib/db')).db.approvalDecision.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    res.json(decisions)
  } catch (err) { next(err) }
})

router.get('/history', async (req, res, next) => {
  try {
    // @ts-ignore
    const rows = await (await import('../../lib/db')).db.decisionHistory.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    res.json(rows)
  } catch (err) { next(err) }
})

router.get('/policies', async (req, res, next) => {
  try {
    // @ts-ignore
    const rows = await (await import('../../lib/db')).db.approvalPolicy.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/recompute', async (req, res, next) => {
  try {
    const { opportunityId } = req.body
    // @ts-ignore
    const opp = await (await import('../../lib/db')).db.opportunity.findUnique({ where: { id: opportunityId } })
    if (!opp) return res.status(404).json({ error: 'opportunity not found' })
    const out = await evaluateOpportunity(opp)
    res.json(out)
  } catch (err) { next(err) }
})

router.post('/manual', async (req, res, next) => {
  try {
    const { opportunityId, decision, actor, reason } = req.body
    // find existing decision
    // @ts-ignore
    const dec = await (await import('../../lib/db')).db.approvalDecision.findUnique({ where: { opportunityId } })
    if (!dec) return res.status(404).json({ error: 'decision not found' })
    const prev = dec.decision
    // @ts-ignore
    await (await import('../../lib/db')).db.decisionHistory.create({ data: { decisionId: dec.id, previousDecision: prev, newDecision: decision, changedBy: actor, reason } })
    // update decision
    // @ts-ignore
    await (await import('../../lib/db')).db.approvalDecision.update({ where: { id: dec.id }, data: { decision } })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.get('/statistics', async (req, res, next) => {
  try {
    // return metrics from DecisionMetric table
    // @ts-ignore
    const rows = await (await import('../../lib/db')).db.decisionMetric.findMany({ orderBy: { computedAt: 'desc' }, take: 200 })
    res.json({ metrics: rows })
  } catch (err) { next(err) }
})

export default router
