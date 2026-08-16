import { telegramService } from './telegram.service'
import { approvalRepository } from '../../repos/approvalRepository'

export async function notifyTelegram(decisionId: string, action: string, details: any) {
  try {
    // Fetch decision details if possible to enrich notification context
    const decision = await approvalRepository.getDecision(decisionId)
    if (decision) {
      if (action === 'created') {
        const breakdown = decision.confidenceBreakdown as any
        const clientTrustScore = breakdown?.clientTrust?.normalized !== undefined ? breakdown.clientTrust.normalized * 100 : undefined
        const scores = {
          confidenceScore: decision.confidenceScore,
          decision: decision.decision,
          clientTrustScore
        }
        await telegramService.sendOpportunityAlert(decision.opportunity, decisionId, scores)
      } else if (action === 'executed') {
        await telegramService.sendExecutionAlert(decisionId, 'started', details)
      } else if (action === 'execution_failed') {
        await telegramService.sendErrorAlert(`Auto-execution failed for decision ${decisionId}`, details?.error)
      }
    } else {
      // Fallback notifications if decision object is not yet written/loaded
      if (action === 'error') {
        await telegramService.sendErrorAlert(details?.message || 'Unknown critical system error')
      }
    }
  } catch (err) {
    // Swallow notification errors to keep the application resilient
  }
}
