/**
 * An error with an HTTP status code. Express's default error handler
 * responds with `status` instead of 500 when it's passed to `next()`.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message?: string
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
