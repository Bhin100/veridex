import { db } from '../../lib/db'
import { executionRepo } from '../../repos/executionRepository'
import { workerManager } from '../../services/workers/manager'
import { logger } from '../../logger'

export const executionOrchestrator = {
  async startExecution(executionId: string) {
    // Load execution with tasks
    const exec = await executionRepo.getExecution(executionId)
    if (!exec) throw new Error('Execution not found')

    // ==================================================
    // PAYMENT GATE — STRICT SERVER-SIDE COMPLIANCE CHECK
    // ==================================================
    // Find the associated contract to verify payment status
    let contract = null
    if (exec.contractId) {
      // @ts-ignore
      contract = await db.contract.findUnique({ where: { id: exec.contractId } })
    } else if (exec.opportunityId) {
      // @ts-ignore
      contract = await db.contract.findFirst({ where: { opportunityId: exec.opportunityId } })
    }

    if (!contract) {
      logger.warn({ executionId }, 'Payment Gate: Blocking execution because no contract exists.')
      // Update execution status to BLOCKED / FAILED
      try {
        // @ts-ignore
        await db.execution.update({ where: { id: executionId }, data: { status: 'failed' } })
      } catch (err) {}
      throw new Error('Payment Gate: Execution blocked. No valid contract found.')
    }

    if (contract.paymentStatus !== 'deposit_confirmed') {
      logger.warn({ executionId, contractId: contract.id, paymentStatus: contract.paymentStatus }, 'Payment Gate: Blocking execution of unpaid contract.')
      // Update execution status to BLOCKED
      try {
        // @ts-ignore
        await db.execution.update({ where: { id: executionId }, data: { status: 'failed' } })
      } catch (err) {}
      throw new Error(`Payment Gate: Work cannot proceed. Contract payment status is ${contract.paymentStatus}. Required deposit_confirmed.`)
    }

    // set status to running
    try {
      // @ts-ignore
      await db.execution.update({ where: { id: executionId }, data: { status: 'running' } })
    } catch (err) {
      // best-effort: continue if model not present
    }

    // Schedule pending tasks
    const tasks = (exec.tasks || []).filter((t: any) => t.status === 'pending' || t.status === 'ready')
    for (const t of tasks) {
      try {
        await workerManager.scheduleTask(t)
      } catch (err) {
        // record failure to schedule
        await executionRepo.addLog(executionId, t.id, 'schedule_failed', { error: String(err) })
        // mark task failed
        await executionRepo.markTaskFailed(t.id, { message: String(err) }, (t.attempts || 0) + 1)
      }
    }

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
      const updated = await db.execution.update({ where: { id: executionId }, data: { status }, include: { tasks: true } })
      if (status === 'completed' || status === 'failed') {
        try {
          const { onExecutionFinished } = await import('../../services/workers/learning_integration')
          await onExecutionFinished(updated)
        } catch (leErr) {
          // best effort
        }
      }
      return { status }
    } catch (err) {
      // fallback
      return { error: String(err) }
    }
  }
}

export default executionOrchestrator
