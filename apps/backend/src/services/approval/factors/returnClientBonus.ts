import { FactorResult } from './index'

export async function returnClientBonus(opportunity: any): Promise<FactorResult> {
  const returning = opportunity.client && opportunity.client.returning ? 1 : 0
  return { raw: returning, normalized: returning }
}
