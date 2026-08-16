import { Router } from 'express'
import { founderPaymentSettingsService } from '../../services/payments/settings'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const settings = await founderPaymentSettingsService.getSettings()
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const body = req.body
    await founderPaymentSettingsService.saveSettings(body)
    res.json({ ok: true, message: 'Founder payment settings saved successfully.' })
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save settings' })
  }
})

export default router
