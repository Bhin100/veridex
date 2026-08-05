import type { ScoringModule } from '../core'
import type { OpportunityInternal } from '../../opportunity/types'

export const urgencyModule: ScoringModule = {
  name: 'urgency',
  weight: 1.5,
  async score(op: OpportunityInternal) {
    if (!op.discoveredAt) return 0
    const ageMs = Date.now() - new Date(op.discoveredAt).getTime()
    const oneDay = 1000 * 60 * 60 * 24
    const score = Math.max(0, 1 - ageMs / (oneDay * 7)) // decays over 7 days
    return Math.round(score * 100) / 100
  }
}
