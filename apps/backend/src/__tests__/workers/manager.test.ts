import { workerRegistry } from '../../services/workers/registry'

describe('Worker manager integration', () => {
  it('can schedule and find workers for task types', async () => {
    const worker = workerRegistry.findForTask('website:deploy')
    expect(worker).toBeTruthy()
  })
})
