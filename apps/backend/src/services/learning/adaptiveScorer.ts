import { ScoringEngine } from '../../../../../packages/shared/src/scoring/core'
import { learningRepository } from '../../repos/learningRepository'

// Adaptive scorer adjusts module weights stored in LearningMetric entries. It is conservative
// and enforces bounds to avoid destabilizing scoring.

const DEFAULT_BOUNDS = { min: 0.1, max: 5.0 }

export async function applyAdaptiveWeights(engine: ScoringEngine) {
  // For each registered module, look up a metric key `weight:<moduleName>` and apply weight
  for (const m of (engine as any).modules || []) {
    const key = `weight:${m.name}`
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const metric = await learningRepository.getMetric(key)
    if (metric && metric.value) {
      const v = Number(metric.value.weight || metric.value)
      const bounded = Math.max(DEFAULT_BOUNDS.min, Math.min(DEFAULT_BOUNDS.max, v))
      m.weight = bounded
    }
  }
}

export async function persistAdaptiveWeight(moduleName: string, weight: number) {
  const key = `weight:${moduleName}`
  return learningRepository.recordMetric('adaptive_weight', key, { weight })
}
