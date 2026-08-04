import { contractRepo } from '../repos/contractRepository'

describe('contract lifecycle', () => {
  it('creates contract and adds audit entries', async () => {
    const c = await contractRepo.create({ opportunityId: 'op1', clientEmail: 'a@a.com', scope: {}, pricing: {}, depositAmount: 100, remainingBalance: 100 })
    expect(c).toHaveProperty('id')
    await contractRepo.addAudit(c.id, { event: 'test_audit' })
    const found = await contractRepo.findById(c.id)
    expect(found).toBeTruthy()
  })
})
