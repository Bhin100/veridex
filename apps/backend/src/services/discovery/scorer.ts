import type { OpportunityPayload } from '../../../../packages/shared/src/discovery/types'

export function computeFreshness(payload: OpportunityPayload): number {
  const discovered = new Date(payload.discoveredAt).getTime()
  const ageMs = Date.now() - discovered
  // freshness in [0,1] where 1 is very fresh (<1h), decays over 30 days
  const max = 1000 * 60 * 60 * 24 * 30
  const val = Math.max(0, 1 - ageMs / max)
  return Math.round(val * 100) / 100
}

export function computeConfidence(payload: OpportunityPayload): number {
  // simple heuristics: presence of title/content increases confidence
  let score = 0.1
  if (payload.title) score += 0.4
  if (payload.content && payload.content.length > 200) score += 0.5
  return Math.min(1, Math.round(score * 100) / 100)
}
