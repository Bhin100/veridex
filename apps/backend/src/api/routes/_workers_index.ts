import express from 'express'
import workersAdmin from './workers_admin'
import workers from './workers'

const router = express.Router()

router.use('/workers', workers)
router.use('/workers/admin', workersAdmin)

export default router
