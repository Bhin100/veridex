import type { OpportunityPayload } from '../../../../../packages/shared/src/discovery/types'

export function normalize(raw: any): OpportunityPayload {
  // Very small normalization helper — real connectors should provide normalized output.
  return {
    source: raw.source,
    externalId: raw.externalId,
    url: raw.url,
    title: raw.title || raw.summary || undefined,
    content: raw.content || raw.text || JSON.stringify(raw).slice(0,1000),
    discoveredAt: raw.discoveredAt || new Date().toISOString(),
    raw
  }
}
