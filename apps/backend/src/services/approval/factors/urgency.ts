import { FactorResult } from './index'

export async function urgency(opportunity: any): Promise<FactorResult> {
  const days = Number(opportunity.deadlineDays || 365)
  const normalized = Math.max(0, 1 - Math.min(1, days / 90))
  return { raw: days, normalized, details: { days } }
}
