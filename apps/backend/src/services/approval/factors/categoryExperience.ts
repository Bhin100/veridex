import { FactorResult } from './index'

export async function categoryExperience(opportunity: any): Promise<FactorResult> {
  const experience = opportunity.categoryExperience || 0.5
  return { raw: experience, normalized: experience }
}
