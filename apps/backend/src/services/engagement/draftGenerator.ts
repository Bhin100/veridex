export interface DraftGenerator {
  generate(workspace: any, opts?: { template?: string; tone?: string }): Promise<{ content: string; confidence: number }>
}

export class TemplateDraftGenerator implements DraftGenerator {
  private templates: Record<string, string>
  constructor(templates?: Record<string,string>){
    this.templates = templates || {
      'default': 'Hello,\n\nWe reviewed your request: {{problemSummary}}. Our proposed next steps are: {{nextSteps}}.\n\nRegards,\nFounder'
    }
  }

  async generate(workspace: any, opts?: { template?: string; tone?: string }) {
    const tpl = this.templates[opts?.template || 'default']
    const problem = workspace?.clientContext?.problemSummary || 'No summary available'
    const nextSteps = 'We need to clarify missing info and propose an initial scoping call.'
    const content = tpl.replace('{{problemSummary}}', problem).replace('{{nextSteps}}', nextSteps)
    // confidence is heuristic based on presence of key fields
    let conf = 0.1
    if (workspace?.clientContext?.problemSummary) conf += 0.3
    if (workspace?.clientContext?.requestedOutcome) conf += 0.3
    if (workspace?.clientContext?.confidence) conf += workspace.clientContext.confidence * 0.3
    conf = Math.min(1, Math.round(conf * 100) / 100)
    return { content, confidence: conf }
  }
}
