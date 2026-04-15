import { Request, Response, NextFunction } from 'express'

/**
 * Wraps an async route handler so that thrown errors
 * are forwarded to Express error middleware automatically.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
