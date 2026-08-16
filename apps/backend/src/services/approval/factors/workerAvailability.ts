import { FactorResult } from './index'

export async function workerAvailability(opportunity: any): Promise<FactorResult> {
  const available = opportunity.workerAvailability || 0.8
  return { raw: available, normalized: available }
}
