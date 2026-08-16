import { BaseConnector } from './connector'
import type { OpportunityPayload } from '../../../../../packages/shared/src/discovery/types'

// A template HttpConnector that can be extended by real connectors.
export class HttpConnector extends BaseConnector {
  private endpoint: string
  constructor(id: string, endpoint: string, opts?: { scanIntervalSec?: number }) {
    super(id, opts)
    this.endpoint = endpoint
  }

  async scan(): Promise<OpportunityPayload[]> {
    // Note: do not perform real discovery logic here. Connectors must implement their own parsing.
    const res = await fetch(this.endpoint, { method: 'GET' })
    if (!res.ok) return []
    const data = await res.text()
    // Minimal normalization stub: externalId as hash of content
    return [{
      source: this.id,
      externalId: String(this.endpoint + ':' + (Date.now())),
      url: this.endpoint,
      title: 'external source',
      content: data.slice(0, 1000),
      discoveredAt: new Date().toISOString(),
      raw: { fetched: true }
    }]
  }
}
