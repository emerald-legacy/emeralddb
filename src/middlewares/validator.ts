import { Request } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { ObjectSchema } from 'joi'

interface ValidationProperties {
  readonly body?: ObjectSchema<object>
  readonly query?: ObjectSchema<object>
}

export type ValidatedRequest<
  ReqSchema extends ValidationProperties,
  Params extends ParamsDictionary = ParamsDictionary,
  QuerySchema = ReqSchema['query'] extends ObjectSchema<infer C> ? C : Query,
  BodySchema = ReqSchema['body'] extends ObjectSchema<infer C> ? C : undefined,
> = Request<Params, unknown, BodySchema, QuerySchema>

/** The part of Express's Response that validate() uses */
interface ValidationResponse {
  status(code: number): { send(body: unknown): unknown }
}

/**
 * Typed with only what it uses from Express, so tests can pass plain objects.
 * It's still assignable wherever Express expects a RequestHandler.
 */
export const validate =
  <Body = undefined, ReqQuery = Query>(schemas: {
    readonly body?: ObjectSchema<Body>
    readonly query?: ObjectSchema<ReqQuery>
  }) =>
  (req: { body: Body; query: ReqQuery }, res: ValidationResponse, next: () => void): void => {
    if (schemas.query) {
      const result = schemas.query.validate(req.query)
      if (result.error) {
        res.status(400).send({ message: result.error.details.map((d) => d.message) })
        return
      }
      // In Express 5, req.query is a getter on the prototype and can't be assigned.
      // An own property shadows it, so handlers see the validated (and converted) values.
      Object.defineProperty(req, 'query', {
        value: result.value,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    }

    if (schemas.body) {
      const result = schemas.body.validate(req.body)
      if (result.error) {
        res.status(400).send({ message: result.error.details.map((d) => d.message) })
        return
      }
      req.body = result.value
    }

    next()
  }
