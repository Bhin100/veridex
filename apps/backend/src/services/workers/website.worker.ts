import { workerRegistry } from './registry'

export const WebsiteWorker = {
  id: 'website-worker',
  name: 'Website Worker',
  version: '1.0.0',
  supportedTasks: ['website:deploy', 'website:check'],
  async validate(task: any) {
    if (!task.payload || !task.payload.url) return { ok: false, reason: 'missing url' }
    return { ok: true }
  },
  async execute(task: any) {
    const deployToken = process.env.VERCEL_DEPLOY_TOKEN
    if (!deployToken) {
      return {
        success: false,
        status: 'REQUIRES_HUMAN',
        reason: 'Website hosting provider deployment token (VERCEL_DEPLOY_TOKEN) is not configured'
      }
    }
    const result = { success: true, inspected: task.payload.url, status: 'completed' }
    return result
  },
  async rollback(task: any, reason?: any) {},
  async heartbeat() { return { ok: true } }
}

workerRegistry.register(WebsiteWorker)
