import { learningRepository } from '../../repos/learningRepository'

// When execution completes, record outcome into learning repository
export async function onExecutionFinished(execution: any) {
  try {
    const lr = { id: require('crypto').randomUUID(), opportunityId: execution.opportunityId, contractId: execution.contractId, clientId: execution.clientId, outcome: execution.status === 'completed' ? 'won' : 'lost', revenue: 0 }
    await learningRepository.storeLearningRecord(lr as any)
  } catch (err) {
    // non-blocking
  }
}
