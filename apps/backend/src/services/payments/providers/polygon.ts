import { BaseProvider } from '../../../../packages/shared/src/payments/provider'

// NOTE: This is a non-production stub. Real Polygon chain integration must be implemented
// using secure providers and never commit private keys. This adapter provides the
// wiring points to add a Polygon USDT monitor.
export class UsdtPolygonProvider extends BaseProvider {
  constructor(){ super('usdt-polygon','USDT Polygon') }

  async watchDeposits(contractId: string) {
    return `${this.id}:sub:${contractId}`
  }

  async verifyDeposit(event: any) {
    return { ok: false, details: { note: 'polygon verification not implemented' } }
  }
}
