export interface FactorResult {
  raw: number
  normalized: number
  details?: any
}

export interface ApprovalPolicyConfig {
  weights?: Record<string, number>
  thresholds?: {
    autoExecute?: number
    manualReview?: number
  }
}

export type DecisionOutcome = 'AUTO_EXECUTE' | 'MANUAL_REVIEW' | 'AUTO_REJECT'

export interface EngineResult {
  decision: DecisionOutcome
  confidence: number
  breakdown: any
  explanation: string
  decisionId: string
}
