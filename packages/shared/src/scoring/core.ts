import type { OpportunityInternal } from '../opportunity/types'

export type ScoreMap = Record<string, number>

export interface ScoringModule {
  name: string
  weight?: number
  score(op: OpportunityInternal): Promise<number>
}

export class ScoringEngine {
  private modules: ScoringModule[] = []

  register(module: ScoringModule) {
    this.modules.push(module)
  }

  async score(op: OpportunityInternal): Promise<{ scores: ScoreMap; finalScore: number }> {
    const scores: ScoreMap = {}
    let totalWeight = 0
    for (const m of this.modules) {
      const w = m.weight ?? 1
      totalWeight += w
      const s = await m.score(op)
      scores[m.name] = s
    }
    let final = 0
    for (const m of this.modules) {
      const w = m.weight ?? 1
      final += (scores[m.name] ?? 0) * (w / totalWeight)
    }
    return { scores, finalScore: Math.round(final * 100) / 100 }
  }
}
