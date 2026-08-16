import { db } from '../lib/db'
import type { WorkspaceState } from '../../../../packages/shared/src/engagement/types'

export class EngagementRepository {
  async createFromOpportunity(opportunity: any) {
    const rec = await db.engagement.create({ data: {
      opportunityId: opportunity.id,
      status: 'new',
      workspace: {
        opportunitySnapshot: opportunity
      }
    }})
    return rec
  }

  async addDraft(engagementId: string, draft: { author?: string; template?: string; tone?: string; content: string; confidence?: number }) {
    const d = await db.draft.create({ data: { engagementId, author: draft.author, template: draft.template, tone: draft.tone, content: draft.content, confidence: draft.confidence ?? 0 } })
    return d
  }

  async updateWorkspace(engagementId: string, workspace: Partial<WorkspaceState>) {
    return db.engagement.update({ where: { id: engagementId }, data: { workspace: { ...(workspace as any) } } })
  }

  async listPendingReviews() {
    return db.draft.findMany({ where: { status: 'draft' }, orderBy: { createdAt: 'desc' }, take: 50 })
  }
}

export const engagementRepo = new EngagementRepository()
