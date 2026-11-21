import type { Request, Response } from 'express'

/**
 * The answer for /api paths that no route handles. Without it they fall through to the
 * client app, which answers GET requests with index.html and a 200. Error responses are
 * never cached (see cacheControl).
 */
export function apiNotFound(req: Request, res: Response): void {
  res.status(404).json({ message: `No API endpoint for ${req.method} ${req.originalUrl}` })
}
