import { learningRepository } from '../../repos/learningRepository'

// Deterministic recommendation engine using historical aggregates.
export async function recommendForOpportunity(opportunity: any) {
  // Fetch ROI per source metric
  const roi = await learningRepository.getMetric('roi_by_source:all')
  const weights = roi && roi.value && roi.value.rows ? roi.value.rows : []

  const recommendations: any[] = []

  // Pricing: if average revenue for this source is significantly higher than average, suggest premium
  const source = opportunity.source || (opportunity.raw && opportunity.raw.source) || 'unknown'
  const sourceRow = (weights || []).find((r: any) => r.source === source)
  if (sourceRow && sourceRow.total_revenue) {
    const avgRevenue = sourceRow.total_revenue / Math.max(1, sourceRow.count)
    if (avgRevenue > 1000) {
      recommendations.push({ type: 'pricing', details: { suggestion: 'premium', avgRevenue }, score: 0.8 })
    } else if (avgRevenue > 300) {
      recommendations.push({ type: 'pricing', details: { suggestion: 'standard', avgRevenue }, score: 0.6 })
    } else {
      recommendations.push({ type: 'pricing', details: { suggestion: 'economy', avgRevenue }, score: 0.4 })
    }
  }

  // Proposal style: prefer styles that had higher selection rates
  const propMetric = await learningRepository.getMetric('proposal_success_rate:all')
  if (propMetric && propMetric.value && propMetric.value.byStyle) {
    const best = Object.entries(propMetric.value.byStyle).sort((a: any,b: any) => b[1].rate - a[1].rate)[0]
    if (best) {
      recommendations.push({ type: 'proposal', details: { bestStyle: best[0], stats: best[1] }, score: 0.7 })
    }
  }

  // Execution order: recommend executing high-ROI platforms first
  const platformMetric = await learningRepository.getMetric('platform_performance:all')
  if (platformMetric && platformMetric.value) {
    const topPlatforms = (platformMetric.value.rows || []).slice(0,3).map((r: any) => r.platform)
    recommendations.push({ type: 'execution_order', details: { platforms: topPlatforms }, score: 0.5 })
  }

  // Client priority: returning clients get priority bump
  if (opportunity.clientId) {
    const profile = await learningRepository.getMetric(`client_profile:${opportunity.clientId}`)
    if (profile && profile.value && profile.value.returnCount && profile.value.returnCount > 1) {
      recommendations.push({ type: 'client_priority', details: { priority: 'high' }, score: 0.9 })
    }
  }

  return recommendations
}
