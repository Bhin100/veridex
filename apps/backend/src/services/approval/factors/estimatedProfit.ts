import { FactorResult } from './index'

export async function estimatedProfit(opportunity: any): Promise<FactorResult> {
  // derive from budget and expected scope
  const budget = Number(opportunity.budget || 0)
  const estimatedCost = Number(opportunity.estimatedCost || (budget * 0.6))
  const profit = Math.max(0, budget - estimatedCost)
  const normalized = budget > 0 ? Math.min(1, profit / Math.max(1, budget)) : 0
  return { raw: profit, normalized, details: { budget, estimatedCost, profit } }
}
