import { workerRegistry } from './registry'
import { workerManager } from './manager'
import { executionRepo } from '../../repos/executionRepository'

// Simple discovery integration: when new opportunities are discovered, create executions or tasks
export async function handleDiscoveredOpportunity(opportunity: any) {
  // Decide if we should create an execution based on opportunity.priority and ready status
  if (!opportunity) return null
  const shouldCreate = (opportunity.priority || 0) >= 0.5
  if (!shouldCreate) return null

  const execution = {
    contractId: null,
    opportunityId: opportunity.id,
    clientId: opportunity.clientId || null,
    status: 'pending',
    priority: Math.round((opportunity.priority || 0) * 10),
    tasks: []
  }

  const created = await executionRepo.createExecution(execution as any)
  // create a default research task
  const task = {
    id: require('crypto').randomUUID(),
    executionId: created.id,
    type: 'research:topic',
    payload: { summary: opportunity.title || opportunity.content || '' },
    status: 'pending',
    attempts: 0,
    maxAttempts: 3
  }
  await executionRepo.addTask(created.id, task as any)
  await workerManager.scheduleTask(task)
  return created
}
