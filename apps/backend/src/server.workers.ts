import { initWorkers } from './services/workers/init'
import { start } from './services/workers/lifecycle'
import { setupGracefulShutdown } from './services/workers/gracefulShutdown'

async function boot() {
  console.log('Initializing workers registry...')
  initWorkers()
  console.log('Starting workers subsystem...')
  start()
  setupGracefulShutdown()
  console.log('Workers subsystem started')
}

boot().catch(err => {
  console.error('Failed to start workers subsystem', err)
  process.exit(1)
})
