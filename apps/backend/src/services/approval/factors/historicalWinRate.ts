import { FactorResult } from './index'

export async function historicalWinRate(opportunity: any, ctx: any): Promise<FactorResult> {
  // Use learningRepository to fetch historical win rate for similar opportunities if available
  try {
    const key = `winrate:category:${opportunity.category || 'global'}`
    // @ts-ignore
    const rec = await ctx.learningRepository.recordMetric ? null : null
    // Fallback: use opportunity.historicalWinRate
    const rate = typeof opportunity.historicalWinRate === 'number' ? opportunity.historicalWinRate : 0.5
    return { raw: rate, normalized: rate, details: { source: 'opportunity' } }
  } catch (err) {
    return { raw: 0.5, normalized: 0.5, details: { error: String(err) } }
  }
}
