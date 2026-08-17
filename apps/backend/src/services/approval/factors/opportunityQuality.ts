import { FactorResult } from './index'

export async function opportunityQuality(opportunity: any): Promise<FactorResult> {
  // quality based on presence of title, description length, attachments, clarity
  const titleScore = opportunity.title ? 1 : 0
  const descLen = (opportunity.description || '').length
  const descScore = Math.min(1, descLen / 400)
  const attachments = (opportunity.attachments || []).length || 0
  const attachScore = Math.min(1, attachments / 3)
  const score = (titleScore * 0.4) + (descScore * 0.4) + (attachScore * 0.2)
  return { raw: score, normalized: score }
}
