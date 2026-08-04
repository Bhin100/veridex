import process from 'process'
import { stop } from './lifecycle'

let shuttingDown = false

export function setupGracefulShutdown() {
  if (shuttingDown) return
  shuttingDown = true

  const handler = async () => {
    console.log('Graceful shutdown initiated for workers subsystem...')
    try {
      await stop()
      console.log('Workers subsystem stopped')
    } catch (err) {
      console.error('Error stopping workers subsystem', err)
    } finally {
      process.exit(0)
    }
  }

  process.on('SIGINT', handler)
  process.on('SIGTERM', handler)
}
