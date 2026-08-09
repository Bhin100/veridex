import { analyzeAndScore } from '../../services/opportunity/processor'
import { Router } from 'express'

const router = Router()

// Admin endpoint to re-analyze an opportunity (protected routes would be added later)
router.post('/reanalysis/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    // fetch raw opportunity and call analyzeAndScore
    // simplified: require op payload in body
    const op = req.body.op
    if (!op) return res.status(400).json({ error: 'op payload required' })
    const result = await analyzeAndScore(op)
    res.json({ status: 'ok', result })
  } catch (err) {
    next(err)
  }
})

export default router
