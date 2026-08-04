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
}

export const executionRepo = new ExecutionRepository()
