import { discoveryManager } from '../services/discovery/manager'
import { BaseConnector } from '../services/discovery/connector'

// Unit tests for discovery manager — uses a fake connector implementation (no business logic)
class FakeConnector extends BaseConnector {
  items: any[]
  constructor(id: string, items: any[]) { super(id); this.items = items }
  async scan() { return this.items }
}

describe('DiscoveryManager', () => {
  it('registers and runs connectors without throwing', async () => {
    const c = new FakeConnector('fake1', [{ source: 'fake1', externalId: '1', discoveredAt: new Date().toISOString() }])
    discoveryManager.register(c)
    discoveryManager.startAll()
    discoveryManager.stopAll()
  })
})
