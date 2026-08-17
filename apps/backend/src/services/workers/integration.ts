import { executionRepo } from '../../repos/executionRepository'
import { learningRepository } from '../../repos/learningRepository'

// Integration hooks to notify other subsystems after task/execution lifecycle events
export async function onExecutionCompleted(execution: any) {
  // notify learning engine
  try {
    const lr = { id: require('crypto').randomUUID(), opportunityId: execution.opportunityId, engagementId: null, contractId: execution.contractId, clientId: execution.clientId, outcome: 'won', revenue: 0 }
    await learningRepository.storeLearningRecord(lr as any)
  } catch (err) { /* non-blocking */ }
}

export async function onPaymentConfirmed(contract: any) {
  // could enqueue an execution start, or update metrics
}
