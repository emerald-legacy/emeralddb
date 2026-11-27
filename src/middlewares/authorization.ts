import { NextFunction, Request, Response } from 'express'
import type { UserRole } from '@5rdb/api'
import { expressjwt as jwt } from 'express-jwt'
import jwks from 'jwks-rsa'
import { auth0Settings } from '../env'
import { HttpError } from '../utils/HttpError'
import { requireCurrentUser } from '../utils/requireCurrentUser'

// The Auth0 API the access tokens are for. The client gets it from /api/auth0.
export const AUTH0_AUDIENCE = 'http://fiveringsdb.com'

// Read when the API is set up, so the server doesn't start without the Auth0 settings
const auth0Domain = auth0Settings().domain

export const authorizedOnly = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${auth0Domain}/`,
  algorithms: ['RS256'],
})

/**
 * Lets only users with the role through, read from the database. Use it behind
 * `authorizedOnly`, wrapped in `asyncHandler`: without a login it fails with 401,
 * without the role with 403.
 */
export function requireRole(role: UserRole) {
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
