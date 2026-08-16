import { learningRepository } from '../../repos/learningRepository'
import { executionRepo } from '../../repos/executionRepository'
import { contractRepo } from '../../repos/contractRepository'

// Core computation functions are implemented as pure modules where possible.

export async function computeWinRate(since?: string) {
  // Win rate = wins / total outcomes
  const sinceClause = since ? `WHERE "createdAt" >= '${since}'` : ''
  const q = `SELECT SUM(CASE WHEN outcome = 'won' THEN 1 ELSE 0 END) AS wins, COUNT(*) AS total FROM "LearningRecord" ${sinceClause}`
  // @ts-ignore
  const res = (await (await import('../../lib/db')).db.$queryRawUnsafe(q)) as any
  const row = res && res[0] ? res[0] : { wins: 0, total: 0 }
  const wins = Number(row.wins || 0)
  const total = Number(row.total || 0)
  const rate = total === 0 ? 0 : wins / total
  await learningRepository.recordMetric('win_rate', `win_rate:${since||'all'}`, { wins, total, rate })
  return { wins, total, rate }
}

export async function computeAverageRevenue(since?: string) {
  const sinceClause = since ? `WHERE "createdAt" >= '${since}'` : ''
  const q = `SELECT AVG(revenue) as avg_revenue, SUM(revenue) as total_revenue FROM "LearningRecord" ${sinceClause}`
  // @ts-ignore
  const res = (await (await import('../../lib/db')).db.$queryRawUnsafe(q)) as any
  const row = res && res[0] ? res[0] : { avg_revenue: 0, total_revenue: 0 }
  await learningRepository.recordMetric('avg_revenue', `avg_revenue:${since||'all'}`, { avg: Number(row.avg_revenue || 0), total: Number(row.total_revenue || 0) })
  return { avg: Number(row.avg_revenue || 0), total: Number(row.total_revenue || 0) }
}

export async function computeAvgResponseTime(since?: string) {
  const sinceClause = since ? `WHERE "createdAt" >= '${since}'` : ''
  const q = `SELECT AVG("responseTimeMs") as avg_response_time FROM "LearningRecord" ${sinceClause}`
  // @ts-ignore
  const res = (await (await import('../../lib/db')).db.$queryRawUnsafe(q)) as any
  const row = res && res[0] ? res[0] : { avg_response_time: null }
  await learningRepository.recordMetric('avg_response_time', `avg_response_time:${since||'all'}`, { avg: row.avg_response_time ? Number(row.avg_response_time) : null })
  return { avg: row.avg_response_time ? Number(row.avg_response_time) : null }
}

export async function computeROIBySource(since?: string) {
  // ROI per source = total revenue from source / count of opportunities or cost (cost not tracked; use count as proxy)
  const q = `SELECT COALESCE(raw->>'source','unknown') AS source, SUM(revenue) as total_revenue, COUNT(*) as count FROM "LearningRecord" LEFT JOIN LATERAL (SELECT lessons->'raw' as raw) r ON true GROUP BY source ORDER BY total_revenue DESC LIMIT 50`
  // @ts-ignore
  const res = (await (await import('../../lib/db')).db.$queryRawUnsafe(q)) as any
  await learningRepository.recordMetric('roi_by_source', `roi_by_source:${since||'all'}`, { rows: res })
  return res
}

export async function computeAllMetrics() {
  // compute a core set of metrics
  await Promise.all([
    computeWinRate(),
    computeAverageRevenue(),
    computeAvgResponseTime(),
    computeROIBySource()
  ])
}
