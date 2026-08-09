export type PaymentState =
  | 'awaiting_agreement'
  | 'awaiting_deposit'
  | 'deposit_detected'
  | 'deposit_verifying'
  | 'deposit_confirmed'
  | 'work_authorized'
  | 'awaiting_final_payment'
  | 'fully_paid'
  | 'cancelled'

export interface ContractRecord {
  id?: string
  opportunityId: string
  clientEmail: string
  scope?: any
  pricing?: any
  depositAmount?: number
  remainingBalance?: number
  paymentStatus?: PaymentState
  verificationStatus?: string
  timeline?: any
  audit?: any[]
}

export interface DepositRecord {
  id?: string
  contractId: string
  provider: string
  providerId: string
  amount: number
  currency: string
  status?: string
  verified?: boolean
  metadata?: any
}
