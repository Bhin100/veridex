import { workerRegistry } from './registry'

export const ContentWorker = {
  id: 'content-worker',
  name: 'Content Worker',
  version: '1.0.0',
  supportedTasks: ['content:create', 'content:edit'],
  async validate(task: any) { return { ok: true } },
  async execute(task: any) {
    const aiKey = process.env.OPENAI_API_KEY
    if (!aiKey) {
      return {
        success: false,
        status: 'REQUIRES_HUMAN',
        reason: 'AI generation credentials (OPENAI_API_KEY) are not configured'
      }
    }
    return { success: true, status: 'completed' }
  },
  async rollback() {},
  async heartbeat() { return { ok: true } }
}

workerRegistry.register(ContentWorker)
