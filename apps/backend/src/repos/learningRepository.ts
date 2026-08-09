import { db } from '../lib/db'
import type { LearningRecord, ProposalPerformance, ClientProfile } from '../../../../packages/shared/src/learning/types'

export class LearningRepository {
  async storeLearningRecord(rec: Partial<LearningRecord>) {
    // use prisma client if available
    try {
      // @ts-ignore
      const created = await db.learningRecord.create({ data: rec as any })
      return created
    } catch (err: any) {
      // Fallback: use raw SQL insert
      const q = `INSERT INTO "LearningRecord" (id, "opportunityId", "engagementId", "contractId", "clientId", outcome, revenue, "paymentStatus", "executionOutcome", "responseTimeMs", "rejectionReason", lessons, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now(), now()) RETURNING *`
      const params = [rec.id || (rec as any).id || require('crypto').randomUUID(), rec.opportunityId || null, rec.engagementId || null, rec.contractId || null, rec.clientId || null, rec.outcome, rec.revenue || null, rec.paymentStatus || null, rec.executionOutcome || null, rec.responseTimeMs || null, rec.rejectionReason || null, rec.lessons ? JSON.stringify(rec.lessons) : null]
      // @ts-ignore
      const res = await db.$queryRawUnsafe(q, ...params)
      return res
    }
  }

  async addProposalPerformance(pp: Partial<ProposalPerformance>) {
    try {
      // @ts-ignore
      return await db.proposalPerformance.create({ data: pp as any })
    } catch (err: any) {
      const q = `INSERT INTO "ProposalPerformance" (id, "learningRecordId", "proposalId", score, selected, reason, "createdAt") VALUES ($1,$2,$3,$4,$5,$6, now()) RETURNING *`
      const params = [pp.id || require('crypto').randomUUID(), pp.learningRecordId, pp.proposalId || null, pp.score || null, pp.selected ? true : false, pp.reason || null]
      // @ts-ignore
      const res = await db.$queryRawUnsafe(q, ...params)
      return res
    }
  }

  async upsertClientProfile(profile: Partial<ClientProfile>) {
    try {
      // @ts-ignore
      return await db.clientProfile.upsert({ where: { clientId: profile.clientId as any }, update: profile as any, create: profile as any })
    } catch (err: any) {
      // Fallback: try simple select + insert/update
      const found = await db.$queryRawUnsafe(`SELECT * FROM "ClientProfile" WHERE "clientId" = $1 LIMIT 1`, profile.clientId)
      if (found && (found as any).length) {
        const q = `UPDATE "ClientProfile" SET "lastSeenAt" = now(), "lifetimeRevenue" = $2, "preferredPricing" = $3, "preferredProposalStyle" = $4, "returnCount" = $5, "commonObjections" = $6, "negotiationPatterns" = $7, "updatedAt" = now() WHERE "clientId" = $1 RETURNING *`
        const params = [profile.clientId, profile.lifetimeRevenue || 0, profile.preferredPricing ? JSON.stringify(profile.preferredPricing) : null, profile.preferredProposalStyle ? JSON.stringify(profile.preferredProposalStyle) : null, profile.returnCount || 0, profile.commonObjections ? JSON.stringify(profile.commonObjections) : null, profile.negotiationPatterns ? JSON.stringify(profile.negotiationPatterns) : null]
        // @ts-ignore
        return await db.$queryRawUnsafe(q, ...params)
      } else {
        const q = `INSERT INTO "ClientProfile" ("clientId", "lastSeenAt", "lifetimeRevenue", "preferredPricing", "preferredProposalStyle", "returnCount", "commonObjections", "negotiationPatterns", "createdAt", "updatedAt") VALUES ($1, now(), $2, $3, $4, $5, $6, $7, now(), now()) RETURNING *`
        const params = [profile.clientId, profile.lifetimeRevenue || 0, profile.preferredPricing ? JSON.stringify(profile.preferredPricing) : null, profile.preferredProposalStyle ? JSON.stringify(profile.preferredProposalStyle) : null, profile.returnCount || 0, profile.commonObjections ? JSON.stringify(profile.commonObjections) : null, profile.negotiationPatterns ? JSON.stringify(profile.negotiationPatterns) : null]
        // @ts-ignore
        return await db.$queryRawUnsafe(q, ...params)
      }
    }
  }

  async recordMetric(name: string, key: string, value: any) {
    try {
      // @ts-ignore
      return await db.learningMetric.upsert({ where: { key }, update: { name, value, computedAt: new Date() } as any, create: { name, key, value } as any })
    } catch (err: any) {
      const q = `INSERT INTO "LearningMetric" (id, name, key, value, "computedAt") VALUES ($1,$2,$3,$4, now()) ON CONFLICT (key) DO UPDATE SET value = $4, "computedAt" = now() RETURNING *`
      const params = [require('crypto').randomUUID(), name, key, JSON.stringify(value)]
      // @ts-ignore
      return await db.$queryRawUnsafe(q, ...params)
    }
  }

  async getMetric(key: string) {
    try {
      // @ts-ignore
      return await db.learningMetric.findUnique({ where: { key } })
    } catch (err: any) {
      const q = `SELECT * FROM "LearningMetric" WHERE key = $1 LIMIT 1`
      // @ts-ignore
      const res = await db.$queryRawUnsafe(q, key)
      return (res && (res as any)[0]) || null
    }
  }

  async findLearningRecords(filter: any = {}) {
    // simple query builder using raw SQL for robustness
    const clauses: string[] = []
    const params: any[] = []
    let idx = 1
    for (const k of Object.keys(filter)) {
      clauses.push(`"${k}" = $${idx}`)
      params.push(filter[k])
      idx++
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const q = `SELECT * FROM "LearningRecord" ${where} ORDER BY "createdAt" DESC LIMIT 1000`
    // @ts-ignore
    const res = await db.$queryRawUnsafe(q, ...params)
    return res
  }
}

export const learningRepository = new LearningRepository()
