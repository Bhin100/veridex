// Learning types used across the platform

export type UUID = string

export interface LearningRecord {
  id: string
  opportunityId?: string | null
  engagementId?: string | null
  contractId?: string | null
  clientId?: string | null
  outcome: 'won' | 'lost' | 'no-deal' | 'cancelled'
  revenue?: number | null
  paymentStatus?: string | null
  executionOutcome?: string | null
  responseTimeMs?: number | null
  rejectionReason?: string | null
  lessons?: any | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProposalPerformance {
  id: string
  learningRecordId: string
  proposalId?: string | null
  score?: number | null
  selected: boolean
  reason?: string | null
  createdAt?: string | null
}

export interface ClientProfile {
  clientId: string
  lastSeenAt?: string | null
  lifetimeRevenue?: number | null
  preferredPricing?: any | null
  preferredProposalStyle?: any | null
  returnCount?: number | null
  commonObjections?: any | null
  negotiationPatterns?: any | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface LearningMetric {
  name: string
  key: string
  value: any
  computedAt?: string | null
}

export interface Recommendation {
  type: 'pricing' | 'proposal' | 'execution_order' | 'client_priority' | 'platform'
  details: any
  score: number
}
