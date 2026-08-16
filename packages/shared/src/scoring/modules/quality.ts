import type { ScoringModule } from '../core'
import type { OpportunityInternal } from '../../opportunity/types'

export const qualityModule: ScoringModule = {
  name: 'quality',
  weight: 2,
  async score(op: OpportunityInternal) {
    let score = 0
    if (op.title) score += 0.4
    if (op.content && op.content.length > 200) score += 0.6
    return Math.min(1, Math.round(score * 100) / 100)
  }
}
