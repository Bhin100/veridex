import { Router } from 'express'
import { contractRepo } from '../../repos/contractRepository'
import { founderPaymentSettingsService } from '../../services/payments/settings'

const router = Router()

// Helper to inject the founder's active payment configurations onto contract responses
async function injectPaymentDetails(contract: any) {
  if (!contract) return contract
  const settings = await founderPaymentSettingsService.getSettings()

  let activeAddress = ''
  const network = settings.preferredNetwork || 'usdt-polygon'

  if (network === 'usdt-trc20') {
    activeAddress = settings.usdtTrc20 || ''
  } else if (network === 'usdc-polygon') {
    activeAddress = settings.usdcPolygon || ''
  } else {
    activeAddress = settings.usdtPolygon || ''
  }

  // If the active address for preferred network is missing, fallback to any configured address
  if (!activeAddress) {
    activeAddress = settings.usdtPolygon || settings.usdtTrc20 || settings.usdcPolygon || ''
  }

  return {
    ...contract,
    paymentDetails: {
      network,
      walletAddress: activeAddress,
      amount: contract.depositAmount || 0,
      paymentInstructions: settings.optionalInstructions || '',
      availableWallets: {
        usdtTrc20: settings.usdtTrc20 || null,
        usdtPolygon: settings.usdtPolygon || null,
        usdcPolygon: settings.usdcPolygon || null
      }
    }
  }
}

router.post('/', async (req, res, next) => {
  try {
    // 1. Enforce that founder has configured their payment settings before allowing contract/invoice creation
    const configured = await founderPaymentSettingsService.isConfigured()
    if (!configured) {
      return res.status(400).json({
        error: 'Please configure your receiving wallet in Founder Settings.'
      })
    }

    const body = req.body
    const rec = await contractRepo.create(body)
    const enriched = await injectPaymentDetails(rec)
    res.json(enriched)
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const rec = await contractRepo.findById(id)
    if (!rec) return res.status(404).json({ error: 'not found' })
    const enriched = await injectPaymentDetails(rec)
    res.json(enriched)
  } catch (err) { next(err) }
})

router.post('/:id/deposits', async (req, res, next) => {
  try {
    const id = req.params.id
    const body = req.body
    const d = await contractRepo.addDeposit(id, body)
    await contractRepo.addAudit(id, { event: 'deposit_added', deposit: d })
    res.json(d)
  } catch (err) { next(err) }
})

router.get('/:id/deposits/pending', async (req, res, next) => {
  try {
    const deposits = await contractRepo.findPendingDeposits()
    res.json(deposits)
  } catch (err) { next(err) }
})

export default router
