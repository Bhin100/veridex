import type { OpportunityInternal } from '../../../packages/shared/src/opportunity/types'
import { ScoringEngine } from '../../../packages/shared/src/scoring/core'
import { qualityModule } from '../../../packages/shared/src/scoring/modules/quality'
import { urgencyModule } from '../../../packages/shared/src/scoring/modules/urgency'
import { effortModule } from '../../../packages/shared/src/scoring/modules/effort'
import { valueModule } from '../../../packages/shared/src/scoring/modules/value'
import { riskModule } from '../../../packages/shared/src/scoring/modules/risk'
import { RuleEngine } from '../../../packages/shared/src/rules/engine'
import { opportunityRepo } from '../../repos/opportunityRepository'
import { queues, createAnalysisWorker } from './queues'

const engine = new ScoringEngine()
engine.register(qualityModule)
engine.register(urgencyModule)
engine.register(effortModule)
engine.register(valueModule)
engine.register(riskModule)

const rules = new RuleEngine()
// example rule: require confidence > 0.2 to pass
rules.registerRule('min_confidence', (ctx) => { return (ctx.opportunity.confidence ?? 0) > 0.2 })

export async function analyzeAndScore(op: OpportunityInternal) {
  // Validation
  if (!op.source) throw new Error('Missing source')

  // Run rules
  const ruleResults = rules.evaluate({ opportunity: op })

  // Score components
  const { scores, finalScore } = await engine.score(op)

  // Estimate effort/value (reuse modules outputs)
  const estimatedEffort = scores['effort'] ?? 0
  const estimatedValue = scores['value'] ?? 0

  // Risk indicators
  const riskIndicators = { competition: scores['competition_risk'] ?? scores['competition'] ?? scores['competition_risk'] }

  // Persist
  const rec = await opportunityRepo.create({ ...op, confidence: op.confidence ?? 0, freshness: op.freshness ?? 0, priority: finalScore, estimatedEffort, estimatedValue, riskIndicators })
  await opportunityRepo.addHistory(rec.id, 'analyzed', 'Scoring complete', { scores, ruleResults })

  // Route to priority queue
  if (finalScore >= 0.75) {
    await queues.high.add('op', { id: rec.id })
  } else if (finalScore >= 0.4) {
    await queues.normal.add('op', { id: rec.id })
  } else {
    await queues.low.add('op', { id: rec.id })
  }

  return { rec, scores, finalScore, ruleResults }
}

// Worker starter
export function startOpportunityAnalysisWorker() {
  return createAnalysisWorker(async (job) => {
    const payload = job.data
    // fetch opportunity from DB and analyze (simplified)
    // For now, payload contains full opportunity data in job.data.op
    const op: OpportunityInternal = payload.op
    try {
      await analyzeAndScore(op)
    } catch (err) {
      console.error('Analysis failed for job', job.id, err)
      // mark failed and requeue or archive according to policies (omitted)
    }
  })
}
