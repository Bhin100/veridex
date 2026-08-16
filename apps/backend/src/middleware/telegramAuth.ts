import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { logger } from '../logger'

export interface TelegramRequest extends Request {
  telegramUser?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
  }
}

/**
 * Validates Telegram Mini App initData signature using hmac-sha256
 */
export function verifyTelegramInitData(initData: string, botToken: string): { ok: boolean; user?: any } {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return { ok: false }

    // Remove hash and sort keys
    const sortedKeys = Array.from(params.keys())
      .filter((k) => k !== 'hash')
      .sort()

    const dataCheckString = sortedKeys
      .map((k) => `${k}=${params.get(k)}`)
      .join('\n')

    // Generate secret key using "WebAppData" signature
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      return { ok: false }
    }

    const userRaw = params.get('user')
    const user = userRaw ? JSON.parse(userRaw) : null

    return { ok: true, user }
  } catch (err) {
    return { ok: false }
  }
}

/**
 * Express middleware to strictly enforce Telegram Mini App Founder authorization
 */
export async function telegramAuthMiddleware(req: TelegramRequest, res: Response, next: NextFunction) {
  const initData = (req.header('x-telegram-init-data') || req.query.initData) as string
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const founderChatId = process.env.TELEGRAM_FOUNDER_CHAT_ID

  // Test / Dev fallback bypass
  if (process.env.NODE_ENV === 'test' || (!botToken && process.env.NODE_ENV !== 'production')) {
    logger.debug('Telegram initData verification bypassed in test/development environment.')
    req.telegramUser = { id: Number(founderChatId || 12345), first_name: 'Founder' }
    return next()
  }

  if (!initData || !botToken) {
    logger.warn('Missing Telegram initialization data or token.')
    return res.status(401).json({ error: 'Unauthorized: Missing Telegram initialization data.' })
  }

  const { ok, user } = verifyTelegramInitData(initData, botToken)

  if (!ok || !user) {
    logger.warn({ initData }, 'Invalid Telegram Mini App signature detected.')
    return res.status(401).json({ error: 'Unauthorized: Invalid Telegram authentication signature.' })
  }

  // Authorize: Ensure user is the configured Founder
  if (founderChatId && user.id.toString() !== founderChatId) {
    logger.warn({ userId: user.id, founderChatId }, 'Telegram user is not authorized as Founder.')
    return res.status(403).json({ error: 'Forbidden: Only the Founder can access this application.' })
  }

  req.telegramUser = user
  next()
}
export default telegramAuthMiddleware
