import { EventEmitter } from 'events'
import { workerQueues } from './queues'
import { executionRepo } from '../../repos/executionRepository'

// Worker registry
class WorkerRegistry extends EventEmitter {
  private registry: Map<string, any> = new Map()

  register(worker: any) {
    this.registry.set(worker.id, worker)
    this.emit('registered', worker)
  }

  findForTask(type: string) {
    for (const w of this.registry.values()) {
      if ((w.supportedTasks || []).includes(type)) return w
    }
    return null
  }

  list() { return Array.from(this.registry.values()) }
}

export const workerRegistry = new WorkerRegistry()

// Core processing pipeline
export async function processJob(job: any) {
  const { taskId } = job.data
  // fetch task
  const task = await (await import('../../repos/executionRepository')).executionRepo.getExecution(taskId).catch(() => null)
  // In this pipeline we expect job.data to contain taskId and executionId
  // For robustness, we query task directly by id
  // task object shape expected: Task
  // schedule validation, assignment, execution
}
