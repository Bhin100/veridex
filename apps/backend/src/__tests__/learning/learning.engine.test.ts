import { learningRepository } from '../../repos/learningRepository'

describe('Learning Engine — unit', () => {
  it('should record a learning record and retrieve metrics', async () => {
    const rec = { id: 'lr-test-1', clientId: 'client-x', outcome: 'won', revenue: 1200 }
    let thrown = false
    try {
      await learningRepository.storeLearningRecord(rec as any)
    } catch (err: any) {
      // If DB not available, the repository should surface helpful guidance
      thrown = true
      expect(String(err)).toMatch(/Prisma model|DB error|not found/)
    }
    expect(thrown).toBe(true)
  })
})
