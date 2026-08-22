import { executionOrchestrator } from '../../services/execution/orchestrator'
import { executionRepo } from '../../repos/executionRepository'

import request from 'supertest'
import app from '../../test/app'

describe('Execution orchestrator', () => {
  it('startExecution should throw when execution not found or DB absent', async () => {
    let thrown = false
    try {
      // call startExecution with a fake id
      // @ts-ignore
      await executionOrchestrator.startExecution('nonexistent-id')
    } catch (err: any) {
      thrown = true
      expect(String(err)).toBeDefined()
    }
    expect(thrown).toBe(true)
  })
})
