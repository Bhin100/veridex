import { config } from '../../lib/config'
import { ApplicationError } from '../../lib/errors/ApplicationError'

describe('config validation', () => {
  it('throws when required vars missing', () => {
    const env = { ...process.env }
    delete process.env.DATABASE_URL
    try {
      expect(() => config.validate()).toThrow()
    } finally {
      process.env = env
    }
  })
})
