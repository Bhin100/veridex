import { FactorResult } from './index'

export async function proposalMatchQuality(opportunity: any): Promise<FactorResult> {
  const score = opportunity.proposalMatch || 0.5
  return { raw: score, normalized: score }
}
