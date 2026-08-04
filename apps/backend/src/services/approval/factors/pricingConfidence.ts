import { FactorResult } from './index'

export async function pricingConfidence(opportunity: any): Promise<FactorResult> {
  const priceScore = opportunity.pricingConfidence || 0.5
  return { raw: priceScore, normalized: priceScore }
}
