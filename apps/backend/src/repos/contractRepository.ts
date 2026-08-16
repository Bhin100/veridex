import { db } from '../lib/db'
import type { ContractRecord, DepositRecord } from '../../../../packages/shared/src/payments/types'

export class ContractRepository {
  async create(contract: ContractRecord) {
    const rec = await db.contract.create({ data: {
      opportunityId: contract.opportunityId,
      clientEmail: contract.clientEmail,
      scope: contract.scope,
      pricing: contract.pricing,
      depositAmount: contract.depositAmount ?? 0,
      remainingBalance: contract.remainingBalance ?? 0,
      paymentStatus: contract.paymentStatus ?? 'awaiting_agreement',
      verificationStatus: contract.verificationStatus ?? 'pending',
      timeline: contract.timeline ?? {},
      audit: contract.audit ?? []
    }})
    return rec
  }

  async addAudit(contractId: string, entry: any) {
    const c = await db.contract.findUnique({ where: { id: contractId } })
    const audit = (c?.audit ?? []).concat([entry])
    return db.contract.update({ where: { id: contractId }, data: { audit: audit as any } })
  }

  async addDeposit(contractId: string, d: DepositRecord) {
    const rec = await db.deposit.create({ data: {
      contractId,
      provider: d.provider,
      providerId: d.providerId,
      amount: d.amount,
      currency: d.currency,
      status: d.status ?? 'detected',
      verified: d.verified ?? false,
      metadata: d.metadata ?? {}
    }})
    return rec
  }

  async markDepositVerified(depositId: string) {
    return db.deposit.update({ where: { id: depositId }, data: { verified: true, status: 'verified' } })
  }

  async updatePaymentStatus(contractId: string, status: string) {
    return db.contract.update({ where: { id: contractId }, data: { paymentStatus: status } })
  }

  async findById(id: string) {
    return db.contract.findUnique({ where: { id } })
  }

  async findPendingDeposits() {
    return db.deposit.findMany({ where: { status: 'detected', verified: false }, orderBy: { createdAt: 'asc' } })
  }
}

export const contractRepo = new ContractRepository()
