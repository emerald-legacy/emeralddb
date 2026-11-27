import type { NextFunction, Request, Response } from 'express'

const CACHEABLE = 'public, max-age=300'
const NOT_CACHEABLE = 'no-store'

// Responses that must always be fresh:
// - /users/me is user specific
// - /packs/export is read right after a pack was edited, to import it into another environment
// - /auth0 must match the client of the same deploy (it's read once per page load)
function isNeverCached(path: string): boolean {
  return path === '/users/me' || path === '/auth0' || path.startsWith('/packs/export/')
}

/**
 * Cache-Control for API GET requests: 5 minutes for data that rarely changes.
 * The client re-fetches the paths it changed (see `refreshCache` in client/src/api.ts).
 * Error responses are never cached, so that e.g. a 404 for a card that is created a moment
 * later doesn't stick around.
 */
export function cacheControl(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'GET') {
    next()
    return
  }

  if (isNeverCached(req.path)) {
    res.set('Cache-Control', NOT_CACHEABLE)
    next()
    return
  }

  res.set('Cache-Control', CACHEABLE)
  // The status is only known once the handler has finished, so decide when the headers are sent.
  const writeHead = res.writeHead as (...args: unknown[]) => Response
  res.writeHead = function (this: Response, ...args: unknown[]) {
    const status = typeof args[0] === 'number' ? args[0] : this.statusCode
    if (status >= 400) {
      this.set('Cache-Control', NOT_CACHEABLE)
    }
    return writeHead.apply(this, args)
  } as Response['writeHead']
  next()
}
