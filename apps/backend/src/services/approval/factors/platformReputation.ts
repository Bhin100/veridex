import { FactorResult } from './index'

export async function platformReputation(opportunity: any): Promise<FactorResult> {
  const score = opportunity.platformScore || 0.7
  return { raw: score, normalized: score }
}
