import { TemplateDraftGenerator } from '../services/engagement/draftGenerator'

describe('draft generator', () => {
  it('generates a draft and confidence', async () => {
    const gen = new TemplateDraftGenerator()
    const { content, confidence } = await gen.generate({ clientContext: { problemSummary: 'test', requestedOutcome: 'grow', confidence: 0.5 } } as any)
    expect(typeof content).toBe('string')
    expect(typeof confidence).toBe('number')
  })
})
