import { ApplicationError } from './ApplicationError'

export class ValidationError extends ApplicationError {
  constructor(message = 'Validation failed', details?: any) {
    super(message, 400, 'validation_error', details)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
