import '../../testEnv'
import test from 'ava'
import { ReplyableInteraction, runCommand } from './runCommand'

function fakeInteraction(state: { replied?: boolean; failingReply?: boolean } = {}) {
  const sent: { via: 'reply' | 'followUp'; content: string; ephemeral: boolean }[] = []
  const interaction: ReplyableInteraction = {
    replied: state.replied ?? false,
    deferred: false,
    async reply(options) {
      if (state.failingReply) throw new Error('Discord is down')
      sent.push({ via: 'reply', ...options })
    },
    async followUp(options) {
      sent.push({ via: 'followUp', ...options })
    },
  }
  return { interaction, sent }
}

function failingCommand(error: unknown) {
  return {
    name: 'rulings',
    async handler(): Promise<unknown> {
      throw error
    },
  }
}

// Keeps the expected error logs out of the test output
function silenceConsoleError(t: import('ava').ExecutionContext) {
  const original = console.error
  console.error = () => undefined
  t.teardown(() => {
    console.error = original
  })
}

test.serial('a successful command sends nothing extra', async (t) => {
  const { interaction, sent } = fakeInteraction()
  await runCommand({ name: 'card', handler: async () => 'done' }, interaction)
  t.deepEqual(sent, [])
})

test.serial('a failing command is answered instead of thrown (regression)', async (t) => {
  silenceConsoleError(t)
  const { interaction, sent } = fakeInteraction()
  await t.notThrowsAsync(runCommand(failingCommand(new Error('invalid embed')), interaction))
  t.deepEqual(sent, [
    {
      via: 'reply',
      content: 'Sorry, something went wrong. Please try again later.',
      ephemeral: true,
    },
  ])
})

test.serial('after a first reply, the error goes into a follow-up', async (t) => {
  silenceConsoleError(t)
  const { interaction, sent } = fakeInteraction({ replied: true })
  await runCommand(failingCommand(new Error('second embed failed')), interaction)
  t.deepEqual(
    sent.map((message) => message.via),
    ['followUp']
  )
})

test.serial('a reply that fails as well is only logged', async (t) => {
  silenceConsoleError(t)
  const { interaction } = fakeInteraction({ failingReply: true })
  await t.notThrowsAsync(runCommand(failingCommand('not even an Error'), interaction))
})
