import { ApprovalPolicyConfig, DecisionOutcome, FactorResult, EngineResult } from '../../../packages/shared/src/approval/types'
import { approvalRepository } from '../../repos/approvalRepository'
import { learningRepository } from '../../repos/learningRepository'
import { executionRepo } from '../../repos/executionRepository'
import { executionOrchestrator } from '../execution/orchestrator'
import { applyVetoRules } from './rules'
import { emitAudit } from './audit'
import * as factors from './factors'
import { recordDecisionMetric } from './metrics'

function clamp(n: number) { return Math.max(0, Math.min(100, n)) }

export async function evaluateOpportunity(opportunity: any, opts: { policyId?: string } = {}): Promise<EngineResult> {
  // load policy
  const policy = await approvalRepository.getEffectivePolicy(opts.policyId)
  const config: ApprovalPolicyConfig = policy?.config || { weights: {}, thresholds: { autoExecute: 90, manualReview: 75 } }

  // 1) Hard veto checks
  const vetos = await applyVetoRules(opportunity, { policy })
  if (vetos.vetoed) {
    const decision = 'AUTO_REJECT'
    const breakdown = { veto: { reason: vetos.reasons } }
    const result = { decision, confidence: 0, breakdown, explanation: `Vetoed: ${vetos.reasons.join('; ')}` }
    const saved = await approvalRepository.createDecision(opportunity.id, policy.id, decision, 0, breakdown, { estimatedProfit: null, estimatedTimeHours: null, riskLevel: 'high', explanation: result.explanation })
    await emitAudit(saved.id, 'system', 'created', { reason: 'veto', details: vetos })
    return { ...result, decisionId: saved.id }
  }

  // 2) Evaluate factors deterministically in alphabetical order for reproducibility
  const factorNames = Object.keys(factors).sort()
  const factorResults: Record<string, FactorResult> = {}
  for (const name of factorNames) {
    try {
      // @ts-ignore
      const fn = factors[name]
      if (typeof fn === 'function') {
        const res: FactorResult = await fn(opportunity, { policy, learningRepository, executionRepo })
        factorResults[name] = res
      }
    } catch (err) {
      factorResults[name] = { raw: 0, normalized: 0, details: { error: String(err) } }
    }
  }

  // 3) Weighted aggregation
  let totalWeight = 0
  let weightedScore = 0
  const breakdown: any = {}
  for (const [name, res] of Object.entries(factorResults)) {
    const weight = (config.weights && config.weights[name]) || 1
    totalWeight += weight
    const normalized = typeof res.normalized === 'number' ? res.normalized : 0
    weightedScore += normalized * weight
    breakdown[name] = { ...res, weight }
  }
  const confidence = totalWeight > 0 ? clamp((weightedScore / totalWeight) * 100) : 0

  // 4) Decision thresholds
  let decision: DecisionOutcome = 'AUTO_REJECT'
  const autoThreshold = config.thresholds?.autoExecute ?? 90
  const manualThreshold = config.thresholds?.manualReview ?? 75
  if (confidence >= autoThreshold) decision = 'AUTO_EXECUTE'
  else if (confidence >= manualThreshold) decision = 'MANUAL_REVIEW'
  else decision = 'AUTO_REJECT'

  // 5) Post-decision vetos (payment guardian etc.)
  const postVetos = await applyVetoRules(opportunity, { policy, forPostDecision: true })
  if (postVetos.vetoed) {
    decision = 'MANUAL_REVIEW'
    breakdown.veto = { reason: postVetos.reasons }
  }

  // 6) Estimations
  const estimatedProfit = (breakdown.estimatedProfit && breakdown.estimatedProfit.normalized) ? breakdown.estimatedProfit.normalized * 1000 : null
  const estimatedTimeHours = (breakdown.estimatedTime && breakdown.estimatedTime.normalized) ? breakdown.estimatedTime.normalized * 40 : null
  const riskLevel = confidence > 85 ? 'low' : confidence > 60 ? 'medium' : 'high'

  const explanationParts: string[] = []
  const topFactors = Object.entries(breakdown).sort((a: any, b: any) => ((b[1].normalized||0) - (a[1].normalized||0))).slice(0,5)
  for (const [n, r] of topFactors) explanationParts.push(`${n}: ${(r as any).normalized?.toFixed ? (r as any).normalized.toFixed(2) : ((r as any).normalized || 0)}`)
  const explanation = `${decision} — ${confidence.toFixed(2)}% — Top factors: ${explanationParts.join(', ')}`

  // 7) Persist decision
  const saved = await approvalRepository.createDecision(opportunity.id, policy.id, decision, confidence, breakdown, { estimatedProfit, estimatedTimeHours, riskLevel, explanation })
  await emitAudit(saved.id, 'system', 'created', { decision, confidence })

  // 8) Metrics
  await recordDecisionMetric('confidence', { opportunityId: opportunity.id, confidence })

  // 9) If auto execute, trigger execution orchestrator
  if (decision === 'AUTO_EXECUTE') {
    try {
      const exec = await executionRepo.createExecution({ opportunityId: opportunity.id, clientId: opportunity.clientId, status: 'pending' } as any)
      await executionOrchestrator.startExecution(exec.id)
      await emitAudit(saved.id, 'system', 'executed', { executionId: exec.id })
    } catch (err) {
      await emitAudit(saved.id, 'system', 'execution_failed', { error: String(err) })
    }
  }

  return { decision, confidence, breakdown, explanation, decisionId: saved.id }
}
