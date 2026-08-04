import type { OpportunityInternal } from '../opportunity/types'

export interface RuleContext {
  opportunity: OpportunityInternal
}

export interface RuleResult {
  id: string
  passed: boolean
  reason?: string
}

export class RuleEngine {
  private rules: Array<{ id: string; expr: (ctx: RuleContext) => boolean }> = []

  registerRule(id: string, fn: (ctx: RuleContext) => boolean) {
    this.rules.push({ id, expr: fn })
  }

  evaluate(ctx: RuleContext): RuleResult[] {
    return this.rules.map(r => ({ id: r.id, passed: Boolean(r.expr(ctx)), reason: r.expr(ctx) ? undefined : 'failed' }))
  }
}
