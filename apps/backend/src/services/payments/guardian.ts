import { ContractRepository } from '../../repos/contractRepository'
import { UsdtTrc20Provider } from '../payments/providers/trc20'
import { UsdtPolygonProvider } from '../payments/providers/polygon'
import { contractRepo } from '../../repos/contractRepository'
import { engagementQueues } from '../engagement/queues'

const providers = [ new UsdtTrc20Provider(), new UsdtPolygonProvider() ]

// Payment Guardian monitors deposits and runs verification.
export class PaymentGuardian {
  private subscriptions = new Map<string,string>()

  async registerContract(contractId: string) {
    // subscribe providers (in real system we would filter by provider config)
    for (const p of providers) {
      const sub = await p.watchDeposits(contractId)
      this.subscriptions.set(sub, contractId)
      await contractRepo.addAudit(contractId, { event: 'watch_registered', provider: p.id, sub })
    }
  }

  async unregisterContract(contractId: string) {
    for (const [sub, cid] of this.subscriptions.entries()) {
      if (cid === contractId) {
        const provId = sub.split(':')[0]
        const p = providers.find(x => x.id === provId)
        if (p) await p.unwatchDeposits(sub)
        this.subscriptions.delete(sub)
      }
    }
  }

  async pollPendingDeposits() {
    // simple polling loop to process detected deposits
    const deposits = await contractRepo.findPendingDeposits()
    for (const d of deposits) {
      try {
        // check duplicates by provider/providerId
        // verify via provider
        const p = providers.find(x => x.id === d.provider)
        if (!p) continue
        await contractRepo.addAudit(d.contractId, { event: 'deposit_poll', depositId: d.id, provider: d.provider })
        const v = await p.verifyDeposit(d)
        await contractRepo.addAudit(d.contractId, { event: 'deposit_verify_result', depositId: d.id, ok: v.ok, details: v.details })
        if (v.ok) {
          await contractRepo.markDepositVerified(d.id)
          // mark contract deposit confirmed
          await contractRepo.updatePaymentStatus(d.contractId, 'deposit_confirmed')
          // emit internal event: enqueue to engagement or execution queue (placeholder)
          // For now we record audit and allow other services to react
        } else {
          // failed verification: mark as verifying/failed and continue
          await contractRepo.addAudit(d.contractId, { event: 'deposit_verification_failed', depositId: d.id, details: v.details })
        }
      } catch (err) {
        console.error('Error processing deposit', d.id, err)
      }
    }
  }
}

export const paymentGuardian = new PaymentGuardian()
