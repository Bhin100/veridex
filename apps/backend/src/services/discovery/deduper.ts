import type { OpportunityPayload } from '../../../../../packages/shared/src/discovery/types'
import { opportunityRepository } from '../../repos/opportunityRepository'

export async function dedupe(payload: OpportunityPayload): Promise<boolean> {
  // Exact: source + externalId
  if (payload.externalId) {
    const found = await opportunityRepository.findBySourceExternal(payload.source, payload.externalId)
    if (found) return true
  }
  // Near-duplicate: naive content match
  if (payload.content) {
    const found = await opportunityRepository.findSimilarByContent(payload.source, payload.content)
    if (found && (found as any).length !== 0) return true
  }
  return false
}
