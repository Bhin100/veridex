import { dedupe } from '../services/discovery/deduper'

describe('deduper', () => {
  it('returns false when no duplicates exist', async () => {
    const res = await dedupe({ source: 'nope', discoveredAt: new Date().toISOString() })
    expect(res).toBe(false)
  })
})
