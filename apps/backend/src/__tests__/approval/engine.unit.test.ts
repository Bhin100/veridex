import evaluateOpportunity from '../../services/approval/engine'

describe('Approval engine basic', () => {
  it('computes without crashing for minimal opportunity', async () => {
    const opp = { id: 'test-1', title: 'Test', description: 'desc' }
    // @ts-ignore
    const res = await (await import('../../services/approval/engine')).evaluateOpportunity(opp)
    expect(res).toBeDefined()
  })
})
