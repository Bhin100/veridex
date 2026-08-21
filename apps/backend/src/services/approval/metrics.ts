import { approvalRepository } from '../../repos/approvalRepository'

export async function recordDecisionMetric(name: string, payload: any) {
  const key = `${name}:${payload.opportunityId || 'system'}`
  return approvalRepository.recordMetric(key, name, payload)
}
