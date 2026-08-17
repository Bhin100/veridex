import { workerRegistry } from '../../services/workers/registry'

describe('Workers registry tests', () => {
  it('registers built-in workers', async () => {
    const list = workerRegistry.list()
    // Expect at least the website worker to be registered
    const hasWebsite = list.some((w: any) => w.id === 'website-worker')
    expect(hasWebsite).toBe(true)
  })
})
