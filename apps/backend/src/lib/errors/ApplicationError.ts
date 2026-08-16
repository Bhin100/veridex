export class ApplicationError extends Error {
  public status: number
  public code: string
  public details?: any

  constructor(message: string, status = 500, code = 'application_error', details?: any) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, ApplicationError.prototype)
  }
}
