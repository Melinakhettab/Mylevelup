import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { BadRequestError } from '../utils/errors.js'

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Replaces req.body with the parsed (typed) output.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new BadRequestError(`Validation: ${messages}`)
      }
      throw err
    }
  }
}
