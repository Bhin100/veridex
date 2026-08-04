import type { OpportunityPayload } from '../../../../packages/shared/src/discovery/types'

export interface DiscoveryConnector {
  id: string
  scanIntervalSec?: number
  scan(opts?: { since?: string }): Promise<OpportunityPayload[]>
  health?(): Promise<{ ok: boolean; details?: any }>
}

export abstract class BaseConnector implements DiscoveryConnector {
  id: string
  scanIntervalSec?: number
  constructor(id: string, opts?: { scanIntervalSec?: number }) {
    this.id = id
    this.scanIntervalSec = opts?.scanIntervalSec
  }
  abstract scan(opts?: { since?: string }): Promise<OpportunityPayload[]>
}
