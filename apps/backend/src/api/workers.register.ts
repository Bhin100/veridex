import workersMetrics from './routes/workers_metrics'
import workersRoutes from './routes/_workers_index'

export default function registerWorkerRoutes(app: any) {
  app.use('/api/v1/workers', workersMetrics)
  app.use('/api/v1', workersRoutes)
}
