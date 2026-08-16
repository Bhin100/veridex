export interface OpportunityInternal {
  id?: string
  source: string
  externalId?: string
  url?: string
  title?: string
  content?: string
  raw?: any
  discoveredAt: string
  confidence?: number
  freshness?: number
  priority?: number
  estimatedEffort?: number
  estimatedValue?: number
  riskIndicators?: Record<string, any>
  tags?: string[]
  processingHistory?: Array<{ status: string; message?: string; metadata?: any; createdAt?: string }>
}
