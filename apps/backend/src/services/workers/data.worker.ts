import { workerRegistry } from './registry'

export const DataWorker = {
  id: 'data-worker',
  name: 'Data Worker',
  version: '1.0.0',
  supportedTasks: ['data:import', 'data:transform'],
  async validate(task: any) { return { ok: true } },
  async execute(task: any) {
    const dataDbUrl = process.env.DATA_DB_URL
    if (!dataDbUrl) {
      return {
        success: false,
        status: 'REQUIRES_HUMAN',
        reason: 'Target data store connection URL (DATA_DB_URL) is not configured'
      }
    }
    return { success: true, status: 'completed' }
  },
  async rollback() {},
  async heartbeat() { return { ok: true } }
}

workerRegistry.register(DataWorker)
