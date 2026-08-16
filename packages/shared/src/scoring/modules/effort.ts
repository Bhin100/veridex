import type { ScoringModule } from '../core'
import type { OpportunityInternal } from '../../opportunity/types'

export const effortModule: ScoringModule = {
  name: 'effort',
  weight: 1,
  async score(op: OpportunityInternal) {
    // naive effort estimator: longer content -> more effort
    const len = (op.content || '').length
    if (len === 0) return 0.2
    const score = Math.min(1, len / 2000)
    return Math.round(score * 100) / 100
  }
}
