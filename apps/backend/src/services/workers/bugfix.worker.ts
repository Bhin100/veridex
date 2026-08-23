import { workerRegistry } from './registry'

export const BugfixWorker = {
  id: 'bugfix-worker',
  name: 'Bug Fix Worker',
  version: '1.0.0',
  supportedTasks: ['bug:fix','bug:verify'],
  async validate(task: any) {
    if (!task.payload || !task.payload.repo) return { ok: false, reason: 'missing repo' }
    return { ok: true }
  },
  async execute(task: any) {
    return { success: true }
  },
  async rollback() {},
  async heartbeat() { return { ok: true } }
}

workerRegistry.register(BugfixWorker)
