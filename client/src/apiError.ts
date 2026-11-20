/** Thrown by the API client for a non-2xx response or when the request fails */
export class ApiError extends Error {
  constructor(
    /** The HTTP status, or 0 if there was no response (network failure) */
    readonly status: number,
    /** The response body: parsed JSON, or the plain text the API sends for most errors */
    readonly body: unknown,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function joinIfStrings(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  if (Array.isArray(value) && value.length > 0) {
    return value.map(String).join(', ')
  }
  return undefined
}

/**
 * A message for the user. For an ApiError, that's what the server sent: a plain
 * text message, a list of validation errors, or `{ message: string | string[] }`
 * from the validation middleware.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const { body } = error
    const fromBody =
      joinIfStrings(body) ??
      (typeof body === 'object' && body !== null && 'message' in body
        ? joinIfStrings(body.message)
        : undefined)
    return fromBody ?? error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'unknown error'
}
