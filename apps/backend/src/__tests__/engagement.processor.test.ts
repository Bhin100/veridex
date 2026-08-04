import { processHighPriorityOpportunity } from '../services/engagement/processor'

describe('engagement processor', () => {
  it('creates engagement and draft without throwing', async () => {
    const op = { id: 'test-op', title: 'Need help to increase sales', content: 'We want to grow revenue', confidence: 0.5 }
    const res = await processHighPriorityOpportunity(op)
    expect(res).toHaveProperty('engagement')
    expect(res).toHaveProperty('draft')
  })
})
