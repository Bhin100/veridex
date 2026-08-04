import { FactorResult } from './index'

export async function competition(opportunity: any): Promise<FactorResult> {
  const bids = Number(opportunity.bids || 0)
  const normalized = Math.max(0, 1 - Math.min(1, bids / 20))
  return { raw: bids, normalized, details: { bids } }
}
