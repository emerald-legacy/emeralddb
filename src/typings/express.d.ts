import type { Auth0User } from './auth'

declare global {
  namespace Express {
    interface Request {
      // Set by express-jwt (authorizedOnly) on authenticated routes
      auth?: Auth0User
    }
  }
}

export {}
