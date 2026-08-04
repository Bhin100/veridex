import { ScoringEngine } from '../../../packages/shared/src/scoring/core'
import { qualityModule } from '../../../packages/shared/src/scoring/modules/quality'
import { urgencyModule } from '../../../packages/shared/src/scoring/modules/urgency'
import { effortModule } from '../../../packages/shared/src/scoring/modules/effort'
import { valueModule } from '../../../packages/shared/src/scoring/modules/value'
import { riskModule } from '../../../packages/shared/src/scoring/modules/risk'

describe('scoring engine', () => {
  it('composes scores and returns finalScore', async () => {
    const engine = new ScoringEngine()
    engine.register(qualityModule)
    engine.register(urgencyModule)
    engine.register(effortModule)
    engine.register(valueModule)
    engine.register(riskModule)

    const op = { source: 'test', discoveredAt: new Date().toISOString(), title: 'Increase revenue', content: 'We need to grow sales and reduce churn' }
    const { scores, finalScore } = await engine.score(op as any)
    expect(typeof finalScore).toBe('number')
    expect(Object.keys(scores).length).toBeGreaterThan(0)
  })
})
