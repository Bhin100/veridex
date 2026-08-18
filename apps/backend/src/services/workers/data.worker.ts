import { workerRegistry } from './registry'

export const DataWorker = {
  id: 'data-worker',
  name: 'Data Worker',
  version: '1.0.0',
  supportedTasks: ['data:import','data:transform'],
  async validate(task: any) { return { ok: true } },
  async execute(task: any) { return { success: true } },
  async rollback() {},
  async heartbeat() { return { ok: true } }
}

workerRegistry.register(DataWorker)
