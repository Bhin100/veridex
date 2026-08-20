import { FactorResult } from './index'

export async function estimatedTime(opportunity: any): Promise<FactorResult> {
  const hours = Number(opportunity.estimatedHours || 0)
  const normalized = hours > 0 ? Math.min(1, 1 / Math.log2(hours + 2)) : 0
  return { raw: hours, normalized, details: { hours } }
}
