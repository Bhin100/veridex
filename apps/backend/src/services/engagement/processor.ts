import { engagementRepo } from '../../repos/engagementRepository'
import { TemplateDraftGenerator } from './draftGenerator'
import { engagementQueues, createEngagementWorker } from './queues'

const gen = new TemplateDraftGenerator()

export async function processHighPriorityOpportunity(jobData: any) {
  const op = jobData // expected to be opportunity payload or id+payload
  // create engagement workspace
  const created = await engagementRepo.createFromOpportunity(op)
  const workspace = created.workspace || {}

  // perform client request analysis (basic heuristics)
  const clientContext = {
    problemSummary: op.title || (op.content ? (op.content.slice(0,200)) : undefined),
    requestedOutcome: undefined,
    technologies: [],
    urgency: undefined,
    constraints: [],
    missingInformation: [],
    confidence: op.confidence ?? 0
  }

  // update workspace
  await engagementRepo.updateWorkspace(created.id, { clientContext })

  // generate a draft
  const draft = await gen.generate({ clientContext })
  const drec = await engagementRepo.addDraft(created.id, { author: 'system', template: 'default', tone: 'professional', content: draft.content, confidence: draft.confidence })

  // enqueue for founder review
  await engagementQueues.founderReview.add('draft', { engagementId: created.id, draftId: drec.id })

  return { engagement: created, draft: drec }
}

export function startEngagementWorker() {
  return createEngagementWorker(async (job) => {
    try {
      await processHighPriorityOpportunity(job.data)
    } catch (err) {
      console.error('Engagement processing failed', err)
    }
  })
}
