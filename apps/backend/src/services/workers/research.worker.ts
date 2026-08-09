import { workerRegistry } from './registry'

export const ResearchWorker = {
  id: 'research-worker',
  name: 'Research Worker',
  version: '1.0.0',
  supportedTasks: ['research:topic', 'research:keywords'],
  async validate(task: any) { return { ok: true } },
  async execute(task: any) {
    const searchApiKey = process.env.SERP_API_KEY
    if (!searchApiKey) {
      return {
        success: false,
        status: 'REQUIRES_HUMAN',
        reason: 'Search engine connector credentials (SERP_API_KEY) are not configured'
      }
    }
    return { success: true, status: 'completed' }
  },
  async rollback() {},
  async heartbeat() { return { ok: true } }
}

workerRegistry.register(ResearchWorker)
