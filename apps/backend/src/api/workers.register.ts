import workersMetrics from './routes/worker_control'
import workersRoutes from './routes/_workers_index'

export default function registerWorkerRoutes(app: any) {
  app.use('/api/v1/workers', workersMetrics)
  app.use('/api/v1', workersRoutes)
}
