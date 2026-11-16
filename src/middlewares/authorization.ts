import * as express from 'express'
import { expressjwt as jwt } from 'express-jwt'
import jwks from 'jwks-rsa'
import { getOrInsertDBUser } from '../gateways/storage'
import env from '../env'

const RULES_ADMIN = 'rules_admin'
const DATA_ADMIN = 'data_admin'

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

export async function rulesAdminOnly(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const userId = req.auth?.sub
  if (!userId) {
    res.status(401).send()
    return
  }
  const dbUser = await getOrInsertDBUser(userId)
  if (!dbUser.roles.includes(RULES_ADMIN)) {
    res.status(401).send()
    return
  }
  next()
}

export async function dataAdminOnly(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const userId = req.auth?.sub
  if (!userId) {
    res.status(401).send()
    return
  }
  const dbUser = await getOrInsertDBUser(userId)
  if (!dbUser.roles.includes(DATA_ADMIN)) {
    res.status(401).send()
    return
  }
  next()
}
