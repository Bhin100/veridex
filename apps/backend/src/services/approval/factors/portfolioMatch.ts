import { FactorResult } from './index'

export async function portfolioMatch(opportunity: any): Promise<FactorResult> {
  const match = opportunity.portfolioMatch || 0.5
  return { raw: match, normalized: match }
}
