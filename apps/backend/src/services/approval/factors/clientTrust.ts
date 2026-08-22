import { FactorResult } from './index'

export async function clientTrust(opportunity: any, ctx: any): Promise<FactorResult> {
  // Use client history if available
  const client = opportunity.client || {}
  const pastWins = (client.wins || 0)
  const pastProjects = (client.projects || 0)
  const verified = client.verified ? 1 : 0
  const repeat = client.returning ? 1 : 0
  const score = Math.min(1, (pastWins * 0.5 + pastProjects * 0.2 + verified * 1 + repeat * 0.3) / Math.max(1, pastProjects + 1))
  return { raw: score, normalized: score, details: { pastWins, pastProjects, verified, repeat } }
}
