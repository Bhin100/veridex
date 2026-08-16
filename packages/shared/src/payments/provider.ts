export interface PaymentProvider {
  id: string
  name: string
  // start watching for deposits related to contract; returns subscription id or similar
  watchDeposits(contractId: string, opts?: any): Promise<string>
  // stop watching
  unwatchDeposits(subscriptionId: string): Promise<void>
  // validate a deposit event (verify on-chain proofs etc)
  verifyDeposit(event: any): Promise<{ ok: boolean; details?: any }>
}

export abstract class BaseProvider implements PaymentProvider {
  id: string
  name: string
  constructor(id: string, name: string){ this.id = id; this.name = name }
  async watchDeposits(contractId: string, opts?: any): Promise<string>{
    // providers must implement their own watchers
    return `${this.id}:sub:${contractId}`
  }
  async unwatchDeposits(subscriptionId: string): Promise<void>{ /* noop */ }
  async verifyDeposit(event: any): Promise<{ ok: boolean; details?: any }>{
    // Default: no verification
    return { ok: false, details: { reason: 'not_implemented' } }
  }
}
