import { Service } from './typings/Service'

// Heroku stops a dyno for good 30 seconds after SIGTERM; finish well before
export const TEN_SECONDS = 10 * 1000

const SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const

type Exit = (code: number) => void
const exitProcess: Exit = (code) => process.exit(code)

/**
 * Waits until all services have shut down (requests in flight are answered), then exits.
 * If that takes longer than the timeout, it exits anyway.
 */
export async function shutDown(
  services: Service[],
  exit: Exit,
  timeoutMs = TEN_SECONDS
): Promise<void> {
  const timeout = setTimeout(() => {
    console.error(`SERVER: shutdown took longer than ${timeoutMs} ms, exiting anyway`)
    exit(1)
  }, timeoutMs)
  const results = await Promise.allSettled(services.map((service) => service.shutdown()))
  clearTimeout(timeout)
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('SERVER: shutdown failed', result.reason)
    }
  }
  exit(0)
}

/** Shuts the services down on SIGINT, SIGTERM or SIGQUIT; further signals are ignored */
export function shutDownOnSignals(services: Service[], exit: Exit = exitProcess): void {
  let shuttingDown = false
  for (const signal of SIGNALS) {
    process.on(signal, () => {
      if (shuttingDown) {
        return
      }
      shuttingDown = true
      void shutDown(services, exit)
    })
  }
}
