import test from 'ava'
import { Service } from './typings/Service'
import { shutDown, shutDownOnSignals } from './shutdown'

function service(shutdown: () => Promise<void>): Service {
  return { run: async () => undefined, shutdown }
}

function silenceConsoleError(t: import('ava').ExecutionContext) {
  const original = console.error
  console.error = () => undefined
  t.teardown(() => {
    console.error = original
  })
}

test.serial('exits only after every service has shut down (regression)', async (t) => {
  const events: string[] = []
  const slow = service(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30))
    events.push('server closed')
  })
  const fast = service(async () => {
    events.push('bot closed')
  })
  await shutDown([slow, fast], (code) => events.push(`exit ${code}`))
  t.deepEqual(events, ['bot closed', 'server closed', 'exit 0'])
})

test.serial('a failing service does not keep the others from shutting down', async (t) => {
  silenceConsoleError(t)
  const events: string[] = []
  const failing = service(async () => {
    throw new Error('already closed')
  })
  const other = service(async () => {
    events.push('other closed')
  })
  await shutDown([failing, other], (code) => events.push(`exit ${code}`))
  t.deepEqual(events, ['other closed', 'exit 0'])
})

test.serial('a hanging service ends in an exit after the timeout', async (t) => {
  silenceConsoleError(t)
  const exits: number[] = []
  const hanging = service(() => new Promise(() => undefined))
  void shutDown([hanging], (code) => exits.push(code), 20)
  await new Promise((resolve) => setTimeout(resolve, 60))
  t.deepEqual(exits, [1])
})

test.serial('a signal shuts down once, further signals are ignored', async (t) => {
  const before = process.listeners('SIGTERM').length
  let shutdowns = 0
  const exits: number[] = []
  shutDownOnSignals(
    [
      service(async () => {
        shutdowns += 1
      }),
    ],
    (code) => exits.push(code)
  )
  t.teardown(() => {
    // Only the listeners this test added
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const) {
      process
        .listeners(signal)
        .slice(before)
        .forEach((listener) => {
          process.removeListener(signal, listener)
        })
    }
  })

  // Emitting calls the listeners without sending a real signal
  process.emit('SIGTERM')
  process.emit('SIGINT')
  await new Promise((resolve) => setTimeout(resolve, 10))
  t.is(shutdowns, 1)
  t.deepEqual(exits, [0])
})
