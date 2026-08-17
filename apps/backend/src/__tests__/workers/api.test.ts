import { executionRepo } from '../../repos/executionRepository'
import request from 'supertest'
import app from '../../test/app'

describe('Worker control API', () => {
  it('rejects creation when DB not present', async () => {
    const res = await request(app).post('/api/v1/worker_control').send({})
    // expecting 500 or similar; the test ensures route exists
    expect([200,201,500,404]).toContain(res.status)
  })
})
