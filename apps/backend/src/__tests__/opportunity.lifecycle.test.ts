import { analyzeAndScore } from '../services/opportunity/processor'

describe('opportunity lifecycle (unit)', () => {
  it('analyzeAndScore runs without throwing for a minimal op', async () => {
    const op = { source: 'test', discoveredAt: new Date().toISOString(), title: 'Test', content: 'Testing' }
    const result = await analyzeAndScore(op as any)
    expect(result).toHaveProperty('finalScore')
  }, 10000)
})
