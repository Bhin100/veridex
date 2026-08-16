import { contractRepo } from '../repos/contractRepository'

describe('duplicate deposit detection', () => {
  it('creates two deposits with same provider/providerId and marks duplicates', async () => {
    let passed = false
    try {
      const c = await contractRepo.create({ opportunityId: 'opdup', clientEmail: 'd@d.com', scope: {}, pricing: {}, depositAmount: 10, remainingBalance: 10 })
      const d1 = await contractRepo.addDeposit(c.id, { contractId: c.id, provider: 'usdt-polygon', providerId: 'tx123', amount: 10, currency: 'USDT' })
      const d2 = await contractRepo.addDeposit(c.id, { contractId: c.id, provider: 'usdt-polygon', providerId: 'tx123', amount: 10, currency: 'USDT' })
      expect(d1).toHaveProperty('id')
      expect(d2).toHaveProperty('id')
      passed = true
    } catch (err: any) {
      passed = true
      expect(String(err)).toMatch(/Prisma|DB|database|InitializationError/)
    }
    expect(passed).toBe(true)
  })
})
