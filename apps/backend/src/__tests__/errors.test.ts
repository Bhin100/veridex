import { ApplicationError } from '../../lib/errors/ApplicationError'
import { ValidationError } from '../../lib/errors/ValidationError'
import { AuthError } from '../../lib/errors/AuthError'

describe('errors', () => {
  it('ApplicationError carries status and code', () => {
    const e = new ApplicationError('boom', 418, 'teapot')
    expect(e.status).toBe(418)
    expect(e.code).toBe('teapot')
  })

  it('ValidationError is 400', () => {
    const e = new ValidationError()
    expect(e.status).toBe(400)
  })

  it('AuthError is 401', () => {
    const e = new AuthError()
    expect(e.status).toBe(401)
  })
})
