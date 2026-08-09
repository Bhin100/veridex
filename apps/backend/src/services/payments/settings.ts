import { learningRepository } from '../../repos/learningRepository'

export interface FounderPaymentSettings {
  usdtTrc20?: string
  usdtPolygon?: string
  usdcPolygon?: string
  preferredNetwork?: string
  optionalInstructions?: string
}

export class FounderPaymentSettingsService {
  private static METRIC_KEY = 'founder_payment_settings'

  async getSettings(): Promise<FounderPaymentSettings> {
    try {
      const metric = await learningRepository.getMetric(FounderPaymentSettingsService.METRIC_KEY)
      if (metric && metric.value) {
        return metric.value as FounderPaymentSettings
      }
    } catch (err) {
      console.error('Failed to fetch founder payment settings from DB, falling back to environment:', err)
    }

    // Optional first-time deployment environment fallbacks
    return {
      usdtTrc20: process.env.FOUNDER_USDT_TRC20,
      usdtPolygon: process.env.FOUNDER_USDT_POLYGON,
      usdcPolygon: process.env.FOUNDER_USDC_POLYGON,
      preferredNetwork: process.env.FOUNDER_PREFERRED_NETWORK || 'usdt-polygon',
      optionalInstructions: process.env.FOUNDER_PAYMENT_INSTRUCTIONS || ''
    }
  }

  async saveSettings(settings: FounderPaymentSettings): Promise<void> {
    // Strip any private key/sensitive inputs if they exist (enforce only public addresses)
    const sanitized: FounderPaymentSettings = {
      usdtTrc20: settings.usdtTrc20?.trim(),
      usdtPolygon: settings.usdtPolygon?.trim(),
      usdcPolygon: settings.usdcPolygon?.trim(),
      preferredNetwork: settings.preferredNetwork?.trim() || 'usdt-polygon',
      optionalInstructions: settings.optionalInstructions?.trim() || ''
    }

    // Basic validation to prevent private key lengths (e.g. standard private keys are 64 hex characters)
    for (const [key, val] of Object.entries(sanitized)) {
      if (val && val.length > 50 && (key.includes('usdt') || key.includes('usdc'))) {
        throw new Error('Security Error: Only public receiving wallet addresses are permitted. Never supply private keys or seed phrases.')
      }
    }

    await learningRepository.recordMetric(
      'Founder Payment Settings',
      FounderPaymentSettingsService.METRIC_KEY,
      sanitized
    )
  }

  async isConfigured(): Promise<boolean> {
    const settings = await this.getSettings()
    return !!(settings.usdtTrc20 || settings.usdtPolygon || settings.usdcPolygon)
  }
}

export const founderPaymentSettingsService = new FounderPaymentSettingsService()
