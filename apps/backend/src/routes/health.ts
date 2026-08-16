import { Router } from 'express'
import { db } from '../lib/db'

const router = Router()

router.get('/liveness', async (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

router.get('/readiness', async (req, res) => {
  try {
    // DB check
    await db.$queryRaw`SELECT 1`
    res.json({ status: 'ready' })
  } catch (err) {
    res.status(503).json({ status: 'unready', error: String(err) })
  }
})

export default router
