import type { ScoringModule } from '../core'
import type { OpportunityInternal } from '../../opportunity/types'

export const valueModule: ScoringModule = {
  name: 'value',
  weight: 2,
  async score(op: OpportunityInternal) {
    // simple heuristic: presence of business keywords increases value
    const text = ((op.title || '') + ' ' + (op.content || '')).toLowerCase()
    const keywords = ['revenue','sales','grow','customer','reduce cost','profit']
    let hits = 0
    for (const k of keywords) if (text.includes(k)) hits++
    const score = Math.min(1, hits / keywords.length)
    return Math.round(score * 100) / 100
  }
}
