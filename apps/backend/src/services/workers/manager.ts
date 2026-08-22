import { workerRegistry } from './registry'
import { executionRepo } from '../../repos/executionRepository'
import { workerQueues } from './queues'
import { performance } from 'perf_hooks'

export class WorkerManager {
  private shuttingDown = false

  async scheduleTask(task: any) {
    // validate
    const worker = workerRegistry.findForTask(task.type)
    if (!worker) throw new Error(`no worker for task type ${task.type}`)

    const v = await worker.validate(task)
    if (!v.ok) {
      await executionRepo.addLog(task.executionId, task.id, 'validation_failed', { reason: v.reason })
      await executionRepo.updateTask(task.id, { status: 'failed', error: { reason: v.reason } })
      return null
    }

    // schedule on pending queue
    await workerQueues.pending.add('run', { taskId: task.id })
    await executionRepo.updateTask(task.id, { status: 'ready', scheduledAt: new Date().toISOString() })
    await executionRepo.addLog(task.executionId, task.id, 'scheduled', { worker: worker.id })
    return task.id
  }

  async assignAndRun(task: any) {
    if (this.shuttingDown) {
      // requeue
      await workerQueues.waiting.add('waiting', { taskId: task.id })
      return
    }

    const worker = workerRegistry.findForTask(task.type)
    if (!worker) {
      await executionRepo.addLog(task.executionId, task.id, 'assignment_failed', { reason: 'no worker' })
      await executionRepo.updateTask(task.id, { status: 'failed', error: { reason: 'no worker' } })
      return
    }

    // run
    await executionRepo.updateTask(task.id, { status: 'running', workerId: worker.id, startedAt: new Date().toISOString() })
    await executionRepo.addLog(task.executionId, task.id, 'started', { worker: worker.id })

    const start = performance.now()
    try {
      const result = await worker.execute(task)
      const duration = performance.now() - start
      await executionRepo.updateTask(task.id, { status: 'completed', result, finishedAt: new Date().toISOString() })
      await executionRepo.addLog(task.executionId, task.id, 'completed', { worker: worker.id, result, duration })
    } catch (err: any) {
      const attempts = (task.attempts || 0) + 1
      const max = task.maxAttempts || 3
      const errObj = { message: String(err) }
      await executionRepo.updateTask(task.id, { status: 'failed', attempts, error: errObj })
      await executionRepo.addLog(task.executionId, task.id, 'failed', { worker: worker.id, error: String(err), attempts })

      if (attempts < max) {
        // exponential backoff
        const base = Number(process.env.WORKER_RETRY_BASE_MS || 1000)
        const delay = base * Math.pow(2, attempts - 1)
        await workerQueues.retry.add('retry', { taskId: task.id }, { delay })
        await executionRepo.addLog(task.executionId, task.id, 'scheduled_retry', { delay })
      } else {
        // escalate
        await executionRepo.addLog(task.executionId, task.id, 'escalated', { attempts })
      }
    }
  }

  async shutdown() {
    this.shuttingDown = true
    // allow in-flight tasks to complete
    // implement graceful shutdown hooks if needed
  }
}

export const workerManager = new WorkerManager()
