import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'

/**
 * Wraps an async handler to catch errors and pass them to Express error handling.
 * Generic like Express's RequestHandler, so handlers can declare their route
 * params, body and query types.
 */
export function asyncHandler<
  Params = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
>(
  fn: (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<ResBody | undefined>
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .then((result) => {
        if (result !== undefined && !res.headersSent) {
          res.json(result)
        }
      })
      .catch(next)
  }
}
