import { learningRepository } from '../../repos/learningRepository'

export async function getClientProfile(clientId: string) {
  try {
    // @ts-ignore
    const p = await (await import('../../lib/db')).db.clientProfile.findUnique({ where: { clientId } })
    return p
  } catch (err: any) {
    const res = await (await import('../../lib/db')).db.$queryRawUnsafe(`SELECT * FROM "ClientProfile" WHERE "clientId" = $1 LIMIT 1`, clientId)
    return res && res[0] ? res[0] : null
  }
}

export async function updateProfileFromOutcome(learningRecord: any) {
  if (!learningRecord.clientId) return null
  // derive profile updates
  const profile: any = { clientId: learningRecord.clientId }
  profile.lastSeenAt = new Date().toISOString()
  profile.lifetimeRevenue = learningRecord.revenue || 0
  profile.returnCount = 1
  if (learningRecord.lessons && learningRecord.lessons.preferredPricing) profile.preferredPricing = learningRecord.lessons.preferredPricing
  if (learningRecord.lessons && learningRecord.lessons.proposalStyle) profile.preferredProposalStyle = learningRecord.lessons.proposalStyle
  if (learningRecord.lessons && learningRecord.lessons.commonObjections) profile.commonObjections = learningRecord.lessons.commonObjections
  await learningRepository.upsertClientProfile(profile)
}
