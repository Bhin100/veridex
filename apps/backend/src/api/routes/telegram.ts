import { Router } from 'express'
import { telegramService } from '../../services/approval/telegram.service'
import { approvalRepository } from '../../repos/approvalRepository'
import { db } from '../../lib/db'
import { logger } from '../../logger'
import { executionRepo } from '../../repos/executionRepository'
import { executionOrchestrator } from '../../services/execution/orchestrator'

const router = Router()

// Simple in-memory de-duplication cache for update_ids
const processedUpdates = new Set<number>()

router.post('/webhook', async (req, res, next) => {
  try {
    const update = req.body
    if (!update || typeof update !== 'object') {
      return res.status(400).json({ error: 'Invalid update payload' })
    }

    const updateId = update.update_id
    if (typeof updateId === 'number') {
      if (processedUpdates.has(updateId)) {
        logger.info({ updateId }, 'Ignoring duplicate Telegram update_id')
        return res.json({ ok: true, status: 'duplicate_ignored' })
      }
      processedUpdates.add(updateId)
      // Keep cache size bounded
      if (processedUpdates.size > 5000) {
        const first = processedUpdates.values().next().value
        if (first !== undefined) processedUpdates.delete(first)
      }
    }

    const message = update.message
    const callbackQuery = update.callback_query

    // Determine the sender ID
    const senderId = message?.from?.id?.toString() || callbackQuery?.from?.id?.toString()
    const configuredFounderId = process.env.TELEGRAM_FOUNDER_CHAT_ID

    // Security Gate: Check if the user is authorized as founder
    if (!configuredFounderId || senderId !== configuredFounderId) {
      logger.warn({ senderId, configuredFounderId }, 'Unauthorized access attempt to Telegram command center')

      // Send warning back if possible
      if (message?.chat?.id) {
        await telegramService.sendTelegramAPI('sendMessage', {
          chat_id: message.chat.id,
          text: '⚠️ <b>UNAUTHORIZED</b>: You are not authorized as the Founder of this VERIDEX instance.'
        })
      } else if (callbackQuery?.id) {
        await telegramService.sendTelegramAPI('answerCallbackQuery', {
          callback_query_id: callbackQuery.id,
          text: 'Unauthorized sender ID.',
          show_alert: true
        })
      }
      return res.json({ ok: true, status: 'unauthorized_ignored' })
    }

    // Process Callback Queries (APPROVE, REJECT, ESCALATE, VIEW DETAILS)
    if (callbackQuery) {
      const data = callbackQuery.data
      const chatId = callbackQuery.message?.chat?.id
      const messageId = callbackQuery.message?.message_id

      logger.info({ callbackData: data }, 'Processing Telegram callback query')

      if (data && chatId) {
        // Parse action and decision ID (e.g. APPROVE_cl... or REJECT_cl...)
        const idx = data.indexOf('_')
        const action = idx !== -1 ? data.slice(0, idx) : ''
        const decisionId = idx !== -1 ? data.slice(idx + 1) : ''

        if (decisionId) {
          const decision = await approvalRepository.getDecision(decisionId)
          if (!decision) {
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `❌ Decision <code>${decisionId}</code> not found.`
            })
          } else {
            if (action === 'APPROVE') {
              // Retrieve contract payment state (payment gate verification)
              const contract = await db.contract.findFirst({
                where: { opportunityId: decision.opportunityId }
              })

              if (!contract || contract.paymentStatus !== 'deposit_confirmed') {
                // Payment Gate Block: DO NOT EXECUTE unpaid opportunities
                logger.warn({ decisionId, contractId: contract?.id }, 'Payment Gate Block: Attempted approval of unpaid work')
                await telegramService.sendTelegramAPI('sendMessage', {
                  chat_id: chatId,
                  text: `⚠️ <b>PAYMENT GATE BLOCK</b>\n\nApproval of opportunity <b>${decision.opportunity?.title}</b> rejected. Payment is not verified yet. Work cannot proceed without satisfied payment requirements!`
                })
              } else {
                // Update decision and initiate execution orchestrator
                await db.approvalDecision.update({
                  where: { id: decisionId },
                  data: { decision: 'AUTO_EXECUTE' }
                })
                await approvalRepository.recordHistory(decisionId, decision.decision, 'AUTO_EXECUTE', 'founder_telegram', 'Founder override approve via Telegram')

                // Trigger orchestrator
                const exec = await executionRepo.createExecution({
                  opportunityId: decision.opportunityId,
                  clientId: decision.opportunity?.clientId || null,
                  status: 'pending'
                } as any)
                await executionOrchestrator.startExecution(exec.id)

                await telegramService.sendTelegramAPI('sendMessage', {
                  chat_id: chatId,
                  text: `✅ <b>APPROVED & EXECUTED</b>\n\nOpportunity <b>${decision.opportunity?.title}</b> has been authorized and dispatched to execution orchestrator!\nExecution ID: <code>${exec.id}</code>`
                })
              }
            } else if (action === 'REJECT') {
              await db.approvalDecision.update({
                where: { id: decisionId },
                data: { decision: 'AUTO_REJECT' }
              })
              await approvalRepository.recordHistory(decisionId, decision.decision, 'AUTO_REJECT', 'founder_telegram', 'Founder override reject via Telegram')
              await telegramService.sendTelegramAPI('sendMessage', {
                chat_id: chatId,
                text: `❌ <b>REJECTED</b>\n\nOpportunity <b>${decision.opportunity?.title}</b> has been explicitly rejected.`
              })
            } else if (action === 'ESCALATE') {
              await db.approvalDecision.update({
                where: { id: decisionId },
                data: { decision: 'MANUAL_REVIEW' }
              })
              await approvalRepository.recordHistory(decisionId, decision.decision, 'MANUAL_REVIEW', 'founder_telegram', 'Founder escalated to manual review')
              await telegramService.sendTelegramAPI('sendMessage', {
                chat_id: chatId,
                text: `⚠️ <b>ESCALATED</b>\n\nOpportunity <b>${decision.opportunity?.title}</b> has been escalated to Manual Review.`
              })
            }
          }
        }

        // Answer callback query to remove loading spinner in Telegram client
        await telegramService.sendTelegramAPI('answerCallbackQuery', {
          callback_query_id: callbackQuery.id
        })
      }
      return res.json({ ok: true })
    }

    // Process Incoming Text Commands
    if (message && message.text) {
      const text = message.text.trim()
      const chatId = message.chat.id

      logger.info({ text, chatId }, 'Received Telegram command')

      if (text.startsWith('/')) {
        const cmd = text.split(' ')[0].toLowerCase()

        switch (cmd) {
          case '/start':
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `👋 <b>Welcome to the VERIDEX V1 Intelligence Command Center, Founder!</b>\n\nI am your business operating system. I monitor opportunities, protect your treasury, gate payment compliance, and coordinate autonomous worker fleets on your behalf.\n\nUse /help to see all available commands.`
            })
            break;

          case '/status': {
            const oppCount = await db.opportunity.count()
            const contractCount = await db.contract.count()
            const activeWorkers = await db.workerState.count()
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `💻 <b>SYSTEM STATUS</b>\n\n• <b>Database Connection:</b> ONLINE\n• <b>Discovered Opportunities:</b> ${oppCount}\n• <b>Active Contracts:</b> ${contractCount}\n• <b>Registered Workers:</b> ${activeWorkers}\n• <b>Security Hardening:</b> ACTIVE\n• <b>Payment Gateways:</b> POLYGON, TRON`
            })
            break;
          }

          case '/opportunities': {
            const opps = await db.opportunity.findMany({
              take: 5,
              orderBy: { priority: 'desc' }
            })
            const list = opps.map((o: any) => `• [${o.source}] <b>${o.title}</b> (Priority: ${o.priority}, Val: $${o.estimatedValue})`).join('\n') || 'No opportunities discovered yet.'
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `📊 <b>TOP DISCOVERED OPPORTUNITIES</b>\n\n${list}`
            })
            break;
          }

          case '/approvals': {
            const decs = await db.approvalDecision.findMany({
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: { opportunity: true }
            })
            const list = decs.map((d: any) => `• <b>${d.opportunity?.title || 'Untitled'}</b>\n  State: <code>${d.decision}</code>, Conf: ${d.confidenceScore.toFixed(1)}% (ID: <code>${d.id}</code>)`).join('\n\n') || 'No approval decisions recorded.'
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `⚙️ <b>RECENT APPROVAL DECISIONS</b>\n\n${list}`
            })
            break;
          }

          case '/payments': {
            const deposits = await db.deposit.findMany({
              take: 5,
              orderBy: { createdAt: 'desc' }
            })
            const list = deposits.map((d: any) => `• Provider: <code>${d.provider}</code>, Amt: $${d.amount}, Verified: <b>${d.verified ? 'YES' : 'NO'}</b>`).join('\n') || 'No deposit records found.'
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `💰 <b>TREASURY & DEPOSITS STATUS</b>\n\n${list}`
            })
            break;
          }

          case '/workers': {
            const ws = await db.workerState.findMany()
            const list = ws.map((w: any) => `• <b>${w.name}</b> (v${w.version}) Status: <code>${w.status.toUpperCase()}</code>`).join('\n') || 'No registered worker states.'
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `🤖 <b>AUTONOMOUS WORKER FLEETS</b>\n\n${list}`
            })
            break;
          }

          case '/learning': {
            const recCount = await db.learningRecord.count()
            const metrics = await db.learningMetric.findMany()
            const list = metrics.map((m: any) => `• <b>${m.name}:</b> ${JSON.stringify(m.value)}`).join('\n') || 'No learning metrics computed yet.'
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `🧠 <b>LEARNING ENGINE FEEDBACK</b>\n\nTotal Learning Signals: ${recCount}\n${list}`
            })
            break;
          }

          case '/settings': {
            const wallets = [
              `• <b>TRON USDT:</b> <code>${process.env.FOUNDER_USDT_TRC20 || 'Not Configured'}</code>`,
              `• <b>Polygon USDT:</b> <code>${process.env.FOUNDER_USDT_POLYGON || 'Not Configured'}</code>`,
              `• <b>Polygon USDC:</b> <code>${process.env.FOUNDER_USDC_POLYGON || 'Not Configured'}</code>`
            ].join('\n')
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `⚙️ <b>FOUNDER PAYMENT SETTINGS</b>\n\n${wallets}\n\n<i>Note: Private keys and seed phrases are never collected. Only public wallet receiving addresses are stored for payment matching.</i>`
            })
            break;
          }

          case '/help':
          default:
            await telegramService.sendTelegramAPI('sendMessage', {
              chat_id: chatId,
              text: `❓ <b>VERIDEX COMMAND REFERENCE</b>\n\n/start - Welcome greeting\n/status - Overall system health\n/opportunities - High-priority public opportunities\n/approvals - Recent decision history\n/payments - Payment deposits & escrow ledger\n/workers - Autonomous workers active status\n/learning - Learning metric feedback stats\n/settings - View receiving wallet settings`
            })
            break;
        }
      }
    }

    return res.json({ ok: true })
  } catch (err: any) {
    logger.error({ err }, 'Error processing Telegram webhook update')
    return res.status(500).json({ error: 'Internal processing error' })
  }
})

export default router
