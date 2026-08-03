import { ApplicationError } from './ApplicationError'

export class AuthError extends ApplicationError {
  constructor(message = 'Authentication failed', details?: any) {
    super(message, 401, 'auth_error', details)
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}
