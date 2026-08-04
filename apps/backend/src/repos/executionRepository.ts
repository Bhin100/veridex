import { db } from '../lib/db'
import type { ExecutionRecord, TaskRecord } from '../../../packages/shared/src/workers/types'

export class ExecutionRepository {
  async createExecution(exec: Partial<ExecutionRecord>) {
    try {
      // @ts-ignore
      const rec = await db.execution.create({ data: exec as any })
      return rec
    } catch (err: any) {
      throw new Error('Prisma model "Execution" not found or DB error: ' + String(err))
    }
  }

  async getExecution(id: string) {
    try {
      // @ts-ignore
      return await db.execution.findUnique({ where: { id }, include: { tasks: true } })
    } catch (err: any) {
      throw new Error('Prisma model "Execution" not found or DB error: ' + String(err))
    }
  }

  async addTask(execId: string, task: Partial<TaskRecord>) {
    try {
      // @ts-ignore
      const rec = await db.task.create({ data: { ...task, executionId: execId } })
      return rec
    } catch (err: any) {
      throw new Error('Prisma model "Task" not found or DB error: ' + String(err))
    }
  }

  async updateTask(taskId: string, updates: Partial<TaskRecord>) {
    try {
      // @ts-ignore
      return await db.task.update({ where: { id: taskId }, data: updates })
    } catch (err: any) {
      throw new Error('Prisma model "Task" not found or DB error: ' + String(err))
    }
  }

  async markTaskCompleted(taskId: string, result: any) {
    return this.updateTask(taskId, { status: 'completed', result, finishedAt: new Date().toISOString() } as any)
  }

  async markTaskFailed(taskId: string, error: any, attempts?: number) {
    return this.updateTask(taskId, { status: 'failed', error, attempts } as any)
  }

  async resumeTask(taskId: string) {
    return this.updateTask(taskId, { status: 'pending' } as any)
  }

  async cancelExecution(executionId: string) {
    try {
      // @ts-ignore
      return await db.execution.update({ where: { id: executionId }, data: { status: 'cancelled' } })
    } catch (err: any) {
      throw new Error('Prisma model "Execution" not found or DB error: ' + String(err))
    }
  }

  async addLog(executionId: string, taskId: string, event: string, details: any) {
    try {
      // @ts-ignore
      return await db.taskLog.create({ data: { executionId, taskId, event, details } })
    } catch (err: any) {
      throw new Error('Prisma model "TaskLog" not found or DB error: ' + String(err))
    }
  }

  async listPendingTasks(limit = 50) {
    try {
      // @ts-ignore
      return await db.task.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'asc' }, take: limit })
    } catch (err: any) {
      throw new Error('Prisma model "Task" not found or DB error: ' + String(err))
    }
  }

  async getExecutionByContract(contractId: string) {
    try {
      // @ts-ignore
      return await db.execution.findMany({ where: { contractId }, include: { tasks: true } })
    } catch (err: any) {
      throw new Error('Prisma model "Execution" not found or DB error: ' + String(err))
    }
  }

  async getTasksByStatus(status: string, limit = 100) {
    try {
      // @ts-ignore
      return await db.task.findMany({ where: { status }, orderBy: { createdAt: 'asc' }, take: limit })
    } catch (err: any) {
      throw new Error('Prisma model "Task" not found or DB error: ' + String(err))
    }
  }

  async listExecutions(filter: any = {}) {
    try {
      // @ts-ignore
      return await db.execution.findMany({ where: filter, include: { tasks: true }, orderBy: { createdAt: 'desc' }, take: 200 })
    } catch (err: any) {
      throw new Error('Prisma model "Execution" not found or DB error: ' + String(err))
    }
  }
}

export const executionRepo = new ExecutionRepository()
