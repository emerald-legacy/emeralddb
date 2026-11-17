import { Request, RequestHandler } from 'express'
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

export const validate =
  <Body = undefined, ReqQuery = Query>(schemas: {
    readonly body?: ObjectSchema<Body>
    readonly query?: ObjectSchema<ReqQuery>
  }): RequestHandler<ParamsDictionary, unknown, Body, ReqQuery> =>
  (req, res, next) => {
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
