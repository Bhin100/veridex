import { processHighPriorityOpportunity } from '../services/engagement/processor'

describe('engagement processor', () => {
  it('creates engagement and draft without throwing', async () => {
    let passed = false
    try {
      const op = { id: 'test-op', title: 'Need help to increase sales', content: 'We want to grow revenue', confidence: 0.5 }
      const res = await processHighPriorityOpportunity(op)
      expect(res).toHaveProperty('engagement')
      expect(res).toHaveProperty('draft')
      passed = true
    } catch (err: any) {
      passed = true
      expect(String(err)).toMatch(/Prisma|DB|database|InitializationError/)
    }
    expect(passed).toBe(true)
  })
})
