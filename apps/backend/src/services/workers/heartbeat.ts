import { workerRegistry } from './registry'
import { executionRepo } from '../../repos/executionRepository'

export class HeartbeatMonitor {
  interval: any = null
  constructor(private ttlSeconds = Number(process.env.WORKER_HEARTBEAT_TTL || 30)) {}

  start() {
    this.interval = setInterval(async () => {
      for (const w of workerRegistry.list()) {
        try {
          const ok = await (w.heartbeat ? w.heartbeat() : Promise.resolve({ ok: true }))
          // persist state
          // @ts-ignore
          await (await import('../../lib/db')).db.workerState.upsert({ where: { workerId: w.id }, update: { status: ok.ok ? 'online' : 'unhealthy', lastSeen: new Date(), metadata: { version: w.version } }, create: { workerId: w.id, name: w.name, version: w.version, status: ok.ok ? 'online' : 'unhealthy', lastSeen: new Date(), metadata: { version: w.version } } })
        } catch (err) {
          // store unhealthy
          try {
            // @ts-ignore
            await (await import('../../lib/db')).db.workerState.upsert({ where: { workerId: w.id }, update: { status: 'unhealthy', lastSeen: new Date() }, create: { workerId: w.id, name: w.name, version: w.version, status: 'unhealthy', lastSeen: new Date() } })
          } catch (e) { /* swallow */ }
        }
      }
    }, (this.ttlSeconds * 1000) / 2)
  }

  stop() { if (this.interval) clearInterval(this.interval) }
}

export const heartbeatMonitor = new HeartbeatMonitor()
