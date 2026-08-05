export interface WorkspaceState {
  id?: string
  opportunityId: string
  opportunitySnapshot?: any
  clientContext?: {
    problemSummary?: string
    requestedOutcome?: string
    technologies?: string[]
    urgency?: string
    constraints?: string[]
    missingInformation?: string[]
    confidence?: number
  }
  analysis?: any
  drafts?: Array<{ id?: string; author?: string; template?: string; tone?: string; content?: string; confidence?: number; status?: string }>
  status?: 'new' | 'analyzing' | 'draft_ready' | 'awaiting_founder_review' | 'approved' | 'sent' | 'closed'
  createdAt?: string
  updatedAt?: string
}
