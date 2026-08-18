import { db } from '../lib/db'

export class LearningRepository {
  async storeLearningRecord(record: any) {
    try {
      // Best-effort: try a table named LearningRecord or LearningMetric
      // @ts-ignore
      if (db.learningRecord) {
        // @ts-ignore
        return await db.learningRecord.create({ data: record })
      }
      // fallback to LearningMetric if available
      // @ts-ignore
      if (db.learningMetric) {
        // @ts-ignore
        return await db.learningMetric.create({ data: { name: 'learning_record', key: record.id || require('crypto').randomUUID(), value: record } })
      }
      // last resort: raw insert into a generic table if present
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const uuid = require('crypto').randomUUID()
        // @ts-ignore
        await db.$executeRawUnsafe(`INSERT INTO "LearningMetric" (id, name, key, value, "computedAt") VALUES ($1,$2,$3,$4, now())`, uuid, 'learning_record', record.id || uuid, JSON.stringify(record))
        return { ok: true }
      } catch (e) {
        throw e
      }
    } catch (err) {
      throw new Error('LearningRepository error: ' + String(err))
    }
  }

  async recordMetric(name: string, key: string, payload: any) {
    try {
      // @ts-ignore
      if (db.learningMetric) {
        // @ts-ignore
        return await db.learningMetric.upsert({ where: { key }, update: { value: payload, computedAt: new Date() } as any, create: { name, key, value: payload } as any })
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const uuid = require('crypto').randomUUID()
        // @ts-ignore
        await db.$executeRawUnsafe(`INSERT INTO "LearningMetric" (id, name, key, value, "computedAt") VALUES ($1,$2,$3,$4, now()) ON CONFLICT (key) DO UPDATE SET value = $4, "computedAt" = now()`, uuid, name, key, JSON.stringify(payload))
        return { ok: true }
      } catch (e) { throw e }
    } catch (err) {
      throw new Error('LearningRepository.recordMetric error: ' + String(err))
    }
  }
}

export const learningRepository = new LearningRepository()
