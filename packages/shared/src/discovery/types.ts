// Discovery types used across backend and shared modules
export type UUID = string

export type OpportunityStatus = 'new' | 'queued' | 'processed' | 'archived'

export interface OpportunityPayload {
  source: string // connector id
  externalId?: string // id from source
  url?: string
  title?: string
  content?: string
  discoveredAt: string // ISO timestamp
  raw?: any // raw payload from source
}

export interface OpportunityRecord extends OpportunityPayload {
  id: string
  confidence: number
  freshness: number
  status: OpportunityStatus
  createdAt: string
  updatedAt: string
}
