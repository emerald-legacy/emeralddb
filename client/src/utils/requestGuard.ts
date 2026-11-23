/**
 * Tells whether a request is still the latest one. A response that arrives after a newer
 * request started, or after the page was left, must not be shown.
 */
export function createRequestGuard(): { start: () => () => boolean; cancel: () => void } {
  let latest = 0
  return {
    // Starts a request; the returned function tells whether it is still the latest
    start() {
      const request = ++latest
      return () => request === latest
    },
    // No request that started so far is the latest anymore
    cancel() {
      latest++
    },
  }
}
