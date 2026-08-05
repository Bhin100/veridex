import { BaseProvider } from '../../../../../../packages/shared/src/payments/provider'

// NOTE: This is a non-production stub. Real TRON node integration must be implemented
// using secure providers and never commit private keys. This adapter provides the
// wiring points to add a TRC20 monitor.
export class UsdtTrc20Provider extends BaseProvider {
  constructor(){ super('usdt-trc20','USDT TRC20') }

  async watchDeposits(contractId: string) {
    // In production, register webhooks or subscribe to chain events
    return `${this.id}:sub:${contractId}`
  }

  async verifyDeposit(event: any) {
    // event should contain txHash and amount
    // Placeholder: mark as unverifiable
    return { ok: false, details: { note: 'trc20 verification not implemented' } }
  }
}
