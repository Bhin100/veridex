import { approvalRepository } from '../../repos/approvalRepository'

export async function applyVetoRules(opportunity: any, opts: any = {}) {
  const reasons: string[] = []
  // Check payment guardian if available (dynamic)
  try {
    const pg = (await import('../payments/guardian').catch(() => null)) as any
    if (pg && pg.checkPaymentConfidence) {
      const pc = await pg.checkPaymentConfidence(opportunity)
      if (!pc.ok) reasons.push('payment_confidence_low')
    } else {
      // fallback to opportunity.payment.confidence
      const conf = (opportunity.payment||{}).confidence ?? 0.5
      if (conf < 0.4) reasons.push('payment_confidence_low')
    }
  } catch (err) { /* swallow */ }

  // Client blacklist check
  if (opportunity.client && opportunity.client.blacklisted) reasons.push('client_blacklisted')

  // Scam detection
  if ((opportunity.scamScore || 0) > (opts.policy?.config?.vetoRules?.maxScamScore || 0.7)) reasons.push('scam_score_high')

  // Missing required fields
  const missing = []
  if (!opportunity.title) missing.push('title')
  if (!opportunity.description) missing.push('description')
  if (missing.length) reasons.push('missing_fields:' + missing.join(','))

  const vetoed = reasons.length > 0
  return { vetoed, reasons }
}
