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

    // Optimization: Evaluate all scoring modules concurrently using Promise.all
    // instead of sequentially awaiting each module score sequentially (O(N) latency -> O(1) concurrent latency).
    const moduleResults = await Promise.all(
      this.modules.map(async (m) => {
        const s = await m.score(op)
        return { module: m, score: s }
      })
    )

    let weightedSum = 0
    for (const { module: m, score: s } of moduleResults) {
      const w = m.weight ?? 1
      totalWeight += w
      scores[m.name] = s
      weightedSum += s * w
    }

    const final = totalWeight > 0 ? weightedSum / totalWeight : 0
    return { scores, finalScore: Math.round(final * 100) / 100 }
  }
}
