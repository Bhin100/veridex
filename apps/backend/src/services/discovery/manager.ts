import type { DiscoveryConnector } from './connector'
import { opportunityRepository } from '../../repos/opportunityRepository'
import { computeFreshness } from './scorer'
import { computeConfidence } from './scorer'
import { dedupe } from './deduper'
import { Queue } from 'bullmq'

const queue = new Queue('opportunities', { connection: {
  host: process.env.REDIS_URL ? undefined : undefined
}})

export class DiscoveryManager {
  private connectors = new Map<string, DiscoveryConnector>()
  private running = new Map<string, NodeJS.Timeout>()
  private concurrency = Number(process.env.DISCOVERY_CONCURRENCY || 3)

  register(conn: DiscoveryConnector) {
    this.connectors.set(conn.id, conn)
  }

  startAll() {
    for (const conn of this.connectors.values()) {
      this.startConnector(conn)
    }
  }

  stopAll() {
    for (const [, t] of this.running) clearInterval(t)
    this.running.clear()
  }

  private startConnector(conn: DiscoveryConnector) {
    const interval = (conn.scanIntervalSec || Number(process.env.DISCOVERY_SCAN_SEC || 300)) * 1000
    const timer = setInterval(() => this.runConnector(conn), interval)
    this.running.set(conn.id, timer)
    // kick off initial run
    void this.runConnector(conn)
  }

  private async runConnector(conn: DiscoveryConnector) {
    try {
      const items = await conn.scan()
      for (const item of items) {
        // normalize already done by connector; ensure required fields
        const normalized = { ...item }
        // dedupe
        const duplicate = await dedupe(normalized)
        if (duplicate) continue
        // scoring
        const freshness = computeFreshness(normalized)
        const confidence = computeConfidence(normalized)
        // store
        const rec = await opportunityRepository.create({ ...normalized, freshness, confidence })
        // enqueue
        await queue.add('opportunity', { id: rec.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
      }
    } catch (err) {
      // log and continue per Guardian rules
      console.error('Connector run failed', conn.id, err)
    }
  }
}

export const discoveryManager = new DiscoveryManager()
