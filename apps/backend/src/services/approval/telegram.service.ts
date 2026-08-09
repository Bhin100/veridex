import https from 'https'
import { logger } from '../../logger'

export class TelegramService {
  private get botToken(): string | undefined {
    return process.env.TELEGRAM_BOT_TOKEN
  }

  private get founderChatId(): string | undefined {
    return process.env.TELEGRAM_FOUNDER_CHAT_ID
  }

  private get miniappOrigin(): string | undefined {
    return process.env.TELEGRAM_MINIAPP_ORIGIN
  }

  /**
   * Helper to invoke Telegram Bot API methods securely
   */
  async sendTelegramAPI(method: string, payload: any): Promise<any> {
    const token = this.botToken
    if (!token) {
      logger.warn({ method }, 'Telegram Bot Token not configured. Skipping outbound message.')
      return { ok: false, error: 'bot_token_missing' }
    }

    const postData = JSON.stringify(payload)
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = ''
        res.on('data', (chunk) => { body += chunk })
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body)
            resolve(parsed)
          } catch (e) {
            resolve({ ok: false, error: 'invalid_json_response', body })
          }
        })
      })

      req.on('error', (err) => {
        logger.error({ err, method }, 'Error during Telegram API call')
        resolve({ ok: false, error: err.message })
      })

      req.write(postData)
      req.end()
    })
  }

  /**
   * Sends a message to the configured founder chat ID
   */
  async notifyFounder(text: string, inlineKeyboard?: any[]): Promise<any> {
    const chatHeader = this.founderChatId
    if (!chatHeader) {
      logger.warn('TELEGRAM_FOUNDER_CHAT_ID not configured. Logging text instead:\n' + text)
      return { ok: false, error: 'founder_chat_id_missing' }
    }

    const payload: any = {
      chat_id: chatHeader,
      text,
      parse_mode: 'HTML'
    }

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard
      }
    }

    return this.sendTelegramAPI('sendMessage', payload)
  }

  /**
   * Formats and dispatches a detailed Opportunity Approval Card to the founder
   */
  async sendOpportunityAlert(opportunity: any, decisionId: string, scores: any): Promise<void> {
    const value = opportunity.estimatedValue || 0
    const effort = opportunity.estimatedEffort || 0
    const risk = opportunity.riskIndicators ? JSON.stringify(opportunity.riskIndicators) : 'Low'
    const trustScore = scores?.clientTrustScore ?? 'Unknown'
    const paymentStatus = opportunity.paymentStatus || 'Awaiting Payment'

    const text = `
🔔 <b>IMPORTANT OPPORTUNITY DISCOVERED</b>

<b>Source:</b> ${opportunity.source}
<b>Title:</b> ${opportunity.title || 'Untitled Opportunity'}
<b>Description:</b> ${opportunity.content?.slice(0, 300) || 'N/A'}...

📊 <b>Metrics:</b>
• <b>Estimated Value:</b> $${value.toLocaleString()}
• <b>Estimated Time/Effort:</b> ${effort} Hours
• <b>Risk Profile:</b> ${risk}
• <b>Client Trust Score:</b> ${trustScore}
• <b>Payment Status:</b> ${paymentStatus}

⚙️ <b>Decision Factors:</b>
• Confidence: ${scores?.confidenceScore?.toFixed(2) || '0'}%
• Recommendation: <b>${scores?.decision || 'MANUAL_REVIEW'}</b>

What is your directive, Founder?
`

    const miniAppUrl = this.miniappOrigin ? `${this.miniappOrigin}?decisionId=${decisionId}` : ''

    const inlineKeyboard: any[] = [
      [
        { text: '✅ Approve', callback_data: `APPROVE_${decisionId}` },
        { text: '❌ Reject', callback_data: `REJECT_${decisionId}` }
      ],
      [
        { text: '⚠️ Escalate', callback_data: `ESCALATE_${decisionId}` }
      ]
    ]

    if (miniAppUrl) {
      inlineKeyboard.push([
        { text: '📱 View in Mini App', url: miniAppUrl }
      ])
    }

    await this.notifyFounder(text.trim(), inlineKeyboard)
  }

  async sendExecutionAlert(executionId: string, status: string, details: any): Promise<void> {
    const text = `
⚙️ <b>EXECUTION UPDATE</b>

<b>Execution ID:</b> <code>${executionId}</code>
<b>Status:</b> <code>${status.toUpperCase()}</code>

<b>Details:</b>
${JSON.stringify(details, null, 2)}
`
    await this.notifyFounder(text.trim())
  }

  async sendPaymentAlert(contractId: string, status: string, amount: number, txHash?: string): Promise<void> {
    const text = `
💰 <b>PAYMENT GUARDIAN ALERT</b>

<b>Contract ID:</b> <code>${contractId}</code>
<b>Amount:</b> $${amount.toLocaleString()}
<b>Status:</b> <b>${status.toUpperCase()}</b>
${txHash ? `<b>Transaction Hash:</b> <code>${txHash}</code>` : ''}
`
    await this.notifyFounder(text.trim())
  }

  async sendErrorAlert(message: string, stack?: string): Promise<void> {
    const text = `
🚨 <b>CRITICAL SYSTEM ALERT</b>

<b>Message:</b> ${message}
${stack ? `<b>Stack Trace:</b>\n<pre>${stack.slice(0, 500)}</pre>` : ''}
`
    await this.notifyFounder(text.trim())
  }

  async sendDeliveryAlert(contractId: string, resultUrl?: string): Promise<void> {
    const text = `
📦 <b>DELIVERY READY</b>

<b>Contract ID:</b> <code>${contractId}</code>
<b>Delivery Status:</b> COMPLETED
${resultUrl ? `<b>Result Reference:</b> <a href="${resultUrl}">Open Artifact</a>` : ''}
`
    await this.notifyFounder(text.trim())
  }
}

export const telegramService = new TelegramService()
