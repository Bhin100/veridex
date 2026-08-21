import { FactorResult } from './index'

export async function paymentSafety(opportunity: any, ctx: any): Promise<FactorResult> {
  // Preference for verified payments or escrow
  const payment = opportunity.payment || {}
  const confidence = typeof payment.confidence === 'number' ? payment.confidence : (payment.verified ? 0.9 : 0.5)
  const escrow = payment.escrow ? 1 : 0
  const score = Math.min(1, (confidence * 0.7) + (escrow * 0.3))
  return { raw: confidence, normalized: score, details: payment }
}
