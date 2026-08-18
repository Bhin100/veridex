import { FactorResult } from './index'

export async function executionComplexity(opportunity: any): Promise<FactorResult> {
  const complexity = opportunity.complexity || 0.5
  const normalized = 1 - Math.min(1, complexity)
  return { raw: complexity, normalized, details: { complexity } }
}
