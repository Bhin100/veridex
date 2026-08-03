import { Request, Response, NextFunction } from 'express'
import { logger } from '../logger'

export function requestId(req: Request, res: Response, next: NextFunction) {
  const existing = req.headers['x-request-id'] as string | undefined
  const id = existing || (Math.random().toString(36).substring(2, 10))
  res.setHeader('X-Request-Id', id)
  ;(req as any).requestId = id
  ;(res.locals as any).requestId = id
  // bind to logger if available
  ;(logger as any).requestId = id
  next()
}
