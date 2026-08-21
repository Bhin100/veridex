import { db } from '../../lib/db'
import { executionRepo } from '../../repos/executionRepository'
import { workerManager } from '../../services/workers/manager'

export const executionOrchestrator = {
  async startExecution(executionId: string) {
    // Load execution with tasks
    const exec = await executionRepo.getExecution(executionId)
    if (!exec) throw new Error('execution not found')

    // set status to running
    try {
      // @ts-ignore
      await db.execution.update({ where: { id: executionId }, data: { status: 'running' } })
    } catch (err) {
      // best-effort: continue if model not present
    }

    // Schedule pending tasks concurrently using Promise.all
    // Performance optimization: Concurrently schedules tasks to reduce overall scheduling latency from O(N) to O(1)
    const tasks = (exec.tasks || []).filter((t: any) => t.status === 'pending' || t.status === 'ready')
    await Promise.all(
      tasks.map(async (t: any) => {
        try {
          await workerManager.scheduleTask(t)
        } catch (err) {
          // record failure to schedule
          await executionRepo.addLog(executionId, t.id, 'schedule_failed', { error: String(err) })
          // mark task failed
          await executionRepo.markTaskFailed(t.id, { message: String(err) }, (t.attempts || 0) + 1)
        }
      })
    )

    return { ok: true, scheduled: tasks.length }
  },

  async completeExecution(executionId: string) {
    try {
      // determine final status by task states
      // @ts-ignore
      const exec = await db.execution.findUnique({ where: { id: executionId }, include: { tasks: true } })
      if (!exec) throw new Error('not found')
      const allCompleted = (exec.tasks || []).every((t: any) => t.status === 'completed')
      const anyFailed = (exec.tasks || []).some((t: any) => t.status === 'failed')
      const status = allCompleted ? 'completed' : anyFailed ? 'failed' : 'running'
      // @ts-ignore
      await db.execution.update({ where: { id: executionId }, data: { status } })
      return { status }
    } catch (err) {
      // fallback
      return { error: String(err) }
    }
  }
}

export default executionOrchestrator
