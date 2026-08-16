import { FactorResult } from './index'

export async function executionSuccessPrediction(opportunity: any): Promise<FactorResult> {
  const pred = opportunity.executionSuccessPrediction || 0.6
  return { raw: pred, normalized: pred }
}
