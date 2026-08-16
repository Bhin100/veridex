import type { ScoringModule } from '../core'
import type { OpportunityInternal } from '../../opportunity/types'

export const riskModule: ScoringModule = {
  name: 'competition_risk',
  weight: 1,
  async score(op: OpportunityInternal) {
    // placeholder: detect external signals of competition in text
    const text = ((op.title || '') + ' ' + (op.content || '')).toLowerCase()
    const riskWords = ['competitor','competitors','market saturated','crowded']
    for (const w of riskWords) if (text.includes(w)) return 1
    return 0
  }
}
