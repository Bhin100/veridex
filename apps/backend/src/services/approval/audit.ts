import { approvalRepository } from '../../repos/approvalRepository'
import { notifyTelegram } from './telegram.stub'

export async function emitAudit(decisionId: string, actor: string, action: string, details: any) {
  try {
    await approvalRepository.recordAudit(decisionId, actor, action, details)
  } catch (err) { /* swallow */ }
  try {
    // notify
    await notifyTelegram(decisionId, action, details)
  } catch (e) { /* swallow */ }
}
