import { workerRegistry } from './registry'

// Example Website Worker
export const WebsiteWorker = {
  id: 'website-worker',
  name: 'Website Worker',
  version: '1.0.0',
  supportedTasks: ['website:deploy','website:check'],
  async validate(task: any) {
    if (!task.payload || !task.payload.url) return { ok: false, reason: 'missing url' }
    return { ok: true }
  },
  async execute(task: any) {
    // perform safe checks and return result object
    const result = { success: true, inspected: task.payload.url }
    return result
  },
  async rollback(task: any, reason?: any) {
    // no-op rollback for non-destructive ops
  },
  async heartbeat() { return { ok: true } }
}

workerRegistry.register(WebsiteWorker)
