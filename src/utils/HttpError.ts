/**
 * An error with an HTTP status code. Passed to `next()` (or thrown in a handler
 * wrapped in `asyncHandler`), `errorHandler` responds with `status` and the message.
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
