import { db } from '../lib/db'
import type { OpportunityPayload, OpportunityRecord } from '../../../packages/shared/src/discovery/types'

export class OpportunityRepository {
  async findBySourceExternal(source: string, externalId?: string) {
    if (!externalId) return null
    return db.opportunity.findFirst({ where: { source, externalId } })
  }

  async findSimilarByContent(source: string, content?: string) {
    if (!content) return null
    // naive similarity: find opportunities from same source where content shares a word
    const token = content.split(/\s+/).slice(0,5).join(' ')
    return db.$queryRawUnsafe(`SELECT * FROM "Opportunity" WHERE source = $1 AND content ILIKE $2 LIMIT 1`, source, `%${token}%`)
  }

  async create(payload: OpportunityPayload & { confidence: number; freshness: number }) {
    const rec = await db.opportunity.create({ data: {
      source: payload.source,
      externalId: payload.externalId,
      url: payload.url,
      title: payload.title,
      content: payload.content,
      raw: payload.raw,
      confidence: payload.confidence,
      freshness: payload.freshness,
      status: 'new'
    }})
    return rec
  }

  async markQueued(id: string) {
    return db.opportunity.update({ where: { id }, data: { status: 'queued' } })
  }
}

export const opportunityRepository = new OpportunityRepository()
