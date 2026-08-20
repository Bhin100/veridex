import { FactorResult } from './index'

export async function previousClientBehaviour(opportunity: any): Promise<FactorResult> {
  const client = opportunity.client || {}
  const latePayments = client.latePayments || 0
  const disputes = client.disputes || 0
  const normalized = Math.max(0, 1 - Math.min(1, (latePayments * 0.6 + disputes * 0.8) / 10))
  return { raw: latePayments + disputes, normalized, details: { latePayments, disputes } }
}
