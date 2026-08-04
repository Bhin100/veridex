import { RuleEngine } from '../../../packages/shared/src/rules/engine'

describe('rule engine', () => {
  it('evaluates rules', () => {
    const r = new RuleEngine()
    r.registerRule('hasTitle', (ctx) => !!ctx.opportunity.title)
    const results = r.evaluate({ opportunity: { title: 'x', source: 's', discoveredAt: new Date().toISOString() } as any })
    expect(results.find(rr => rr.id === 'hasTitle')?.passed).toBe(true)
  })
})
