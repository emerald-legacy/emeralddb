import env from '../env'

/** Logs only in development (NODE_ENV=development), never in tests or production */
export function debugLog(...messages: unknown[]): void {
  if (env.nodeEnv === 'development') {
    console.debug(...messages)
  }
}
