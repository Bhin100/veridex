import { FactorResult } from './index'

export async function learningEngineConfidence(opportunity: any, ctx: any): Promise<FactorResult> {
  // Query learningRepository for a confidence estimate if available
  try {
    // @ts-ignore
    const val = opportunity.learningConfidence || 0.6
    return { raw: val, normalized: val, details: { source: 'opportunity' } }
  } catch (err) {
    return { raw: 0.5, normalized: 0.5, details: { error: String(err) } }
  }
}
