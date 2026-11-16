import { Request } from 'express'
import { HttpError } from './HttpError'

/**
 * The Auth0 user id of the logged-in user. Throws a 401 if the request isn't
 * authenticated, so use it only behind `authorizedOnly`.
 */
export function getUserId(req: Request): string {
  const sub = req.auth?.sub
  if (!sub) {
    throw new HttpError(401)
  }
  return sub
}
