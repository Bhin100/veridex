import { db } from '../lib/db'

export class ApprovalRepository {
  async getEffectivePolicy(policyId?: string) {
    try {
      if (policyId) {
        // @ts-ignore
        const p = await db.approvalPolicy.findUnique({ where: { id: policyId } })
        if (p) return p
      }
      // @ts-ignore
      const p2 = await db.approvalPolicy.findFirst({ where: { enabled: true }, orderBy: { createdAt: 'desc' } })
      return p2
    } catch (err) { return null }
  }

  async createDecision(opportunityId: string, policyId: string, decision: string, confidence: number, breakdown: any, extras: any) {
    try {
      // @ts-ignore
      const rec = await db.approvalDecision.create({ data: { opportunityId, policyId, decision, confidenceScore: confidence, confidenceBreakdown: breakdown, estimatedProfit: extras.estimatedProfit, estimatedTimeHours: extras.estimatedTimeHours, riskLevel: extras.riskLevel, explanation: extras.explanation } })
      return rec
    } catch (err) {
      // fallback raw SQL
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const uuid = require('crypto').randomUUID()
        // @ts-ignore
        await db.$executeRawUnsafe(`INSERT INTO "ApprovalDecision" (id, "opportunityId", "policyId", decision, "confidenceScore", "confidenceBreakdown", "estimatedProfit", "estimatedTimeHours", "riskLevel", explanation, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now())`, uuid, opportunityId, policyId, decision, confidence, JSON.stringify(breakdown), extras.estimatedProfit, extras.estimatedTimeHours, extras.riskLevel, extras.explanation)
        // @ts-ignore
        return await db.approvalDecision.findUnique({ where: { opportunityId } })
      } catch (e) { throw e }
    }
  }

  async recordAudit(decisionId: string, actor: string, action: string, details: any) {
    try {
      // @ts-ignore
      return await db.decisionAudit.create({ data: { decisionId, actor, action, details } })
    } catch (err) {
      try {
        const uuid = require('crypto').randomUUID()
        // @ts-ignore
        await db.$executeRawUnsafe(`INSERT INTO "DecisionAudit" (id, "decisionId", actor, action, details, "createdAt") VALUES ($1,$2,$3,$4,$5, now())`, uuid, decisionId, actor, action, JSON.stringify(details))
        // @ts-ignore
        return await db.decisionAudit.findFirst({ where: { decisionId }, orderBy: { createdAt: 'desc' } })
      } catch (e) { throw e }
    }
  }

  async recordHistory(decisionId: string, previousDecision: string, newDecision: string, changedBy?: string, reason?: string) {
    // @ts-ignore
    return await db.decisionHistory.create({ data: { decisionId, previousDecision, newDecision, changedBy, reason } })
  }

  async recordMetric(key: string, name: string, value: any) {
    try {
      // @ts-ignore
      return await db.decisionMetric.upsert({ where: { key }, update: { value, computedAt: new Date() }, create: { key, name, value } as any })
    } catch (err) {
      try {
        const uuid = require('crypto').randomUUID()
        // @ts-ignore
        await db.$executeRawUnsafe(`INSERT INTO "DecisionMetric" (id, key, name, value, "computedAt") VALUES ($1,$2,$3,$4, now()) ON CONFLICT (key) DO UPDATE SET value = $4, "computedAt" = now()`, uuid, key, name, JSON.stringify(value))
        // @ts-ignore
        return await db.decisionMetric.findUnique({ where: { key } })
      } catch (e) { throw e }
    }
  }
}

export const approvalRepository = new ApprovalRepository()
