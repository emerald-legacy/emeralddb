import { STATUS_CODES } from 'http'
import type { NextFunction, Request, Response } from 'express'

// The status of an HttpError, of express-jwt's UnauthorizedError or of a body-parser error
function statusOf(error: unknown): number {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const { status } = error
    if (typeof status === 'number' && status >= 400 && status < 600) {
      return status
    }
  }
  return 500
}

/**
 * Sends errors of the API as JSON: `{ message }` with the error's status. Client errors
 * (4xx) keep their message; anything else is a 500 with a generic message and is logged,
 * so stack traces and internals never reach the client.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    // Too late to send an error; Express closes the connection
    next(error)
    return
  }
  const status = statusOf(error)
  if (status >= 500) {
    console.error('API error:', error)
  }
  const ownMessage = status < 500 && error instanceof Error ? error.message : ''
  res.status(status).json({ message: ownMessage || STATUS_CODES[status] || 'Error' })
}
