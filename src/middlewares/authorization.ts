import { NextFunction, Request, Response } from 'express'
import { expressjwt as jwt } from 'express-jwt'
import jwks from 'jwks-rsa'
import env from '../env'
import { HttpError } from '../utils/HttpError'
import { requireCurrentUser } from '../utils/requireCurrentUser'

export const authorizedOnly = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${env.auth0Domain}/.well-known/jwks.json`,
  }),
  audience: 'http://fiveringsdb.com',
  issuer: `https://${env.auth0Domain}/`,
  algorithms: ['RS256'],
})

export type Role = 'data_admin' | 'rules_admin'

/**
 * Lets only users with the role through, read from the database. Use it behind
 * `authorizedOnly`, wrapped in `asyncHandler`: without a login it fails with 401,
 * without the role with 403.
 */
export function requireRole(role: Role) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = await requireCurrentUser(req)
    if (!user.roles.includes(role)) {
      throw new HttpError(403, `This needs the ${role} role`)
    }
    next()
  }
}

export const dataAdminOnly = requireRole('data_admin')
export const rulesAdminOnly = requireRole('rules_admin')
