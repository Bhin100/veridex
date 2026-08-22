import { FactorResult } from './index'

export async function scamDetection(opportunity: any): Promise<FactorResult> {
  // Simple heuristic: rapid contact details missing, low payment confidence
  const spamSignals = 0 + (opportunity.missingContact ? 1 : 0) + ((opportunity.payment||{}).confidence < 0.4 ? 1 : 0)
  const normalized = Math.max(0, 1 - Math.min(1, spamSignals / 3))
  return { raw: spamSignals, normalized, details: { spamSignals } }
}
