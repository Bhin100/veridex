import { db } from '../lib/db'
import type { OpportunityInternal } from '../../../packages/shared/src/opportunity/types'

export class OpportunityRepositoryFull {
  async create(op: OpportunityInternal) {
    const data: any = {
      source: op.source,
      externalId: op.externalId,
      url: op.url,
      title: op.title,
      content: op.content,
      raw: op.raw,
      confidence: op.confidence ?? 0,
      freshness: op.freshness ?? 0,
      priority: op.priority ?? 0,
      estimatedEffort: op.estimatedEffort ?? 0,
      estimatedValue: op.estimatedValue ?? 0,
      riskIndicators: op.riskIndicators ?? {},
      tags: op.tags ?? []
    }
    const rec = await db.opportunity.create({ data })
    return rec
  }

  async addHistory(opportunityId: string, status: string, message?: string, metadata?: any) {
    return db.opportunityProcessingHistory.create({ data: { opportunityId, status, message, metadata } })
  }

  async updatePriority(id: string, priority: number) {
    return db.opportunity.update({ where: { id }, data: { priority } })
  }

  async findNextForAnalysis(limit = 10) {
    return db.opportunity.findMany({ where: { status: 'new' }, take: limit, orderBy: { createdAt: 'asc' } })
  }
}

export const opportunityRepo = new OpportunityRepositoryFull()
