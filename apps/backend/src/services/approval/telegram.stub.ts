export async function notifyTelegram(decisionId: string, action: string, details: any) {
  // safe noop until telegram module available
  try {
    const tg = await import('./telegram').catch(() => null)
    if (tg && tg.sendDecisionNotification) {
      await tg.sendDecisionNotification(decisionId, action, details)
    }
  } catch (err) { /* swallow */ }
}
