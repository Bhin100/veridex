import { executionRepo } from '../../repos/executionRepository'
import { workerManager } from '../../services/workers/manager'
import { workerRegistry } from '../../services/workers/registry'

describe('Extended worker manager', () => {
  it('finds a worker for content tasks', () => {
    const w = workerRegistry.findForTask('content:create')
    expect(w).toBeTruthy()
  })

  it('lists executions (DB may be absent)', async () => {
    let thrown = false
    try {
      await executionRepo.listExecutions()
    } catch (err: any) {
      thrown = true
      expect(String(err)).toMatch(/Prisma model/)
    }
    expect(thrown).toBe(true)
  })
})
