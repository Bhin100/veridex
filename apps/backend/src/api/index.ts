import express from 'express'
import workersRoutes from './routes/_workers_index'

const router = express.Router()

router.use('/v1', workersRoutes)

export default router
