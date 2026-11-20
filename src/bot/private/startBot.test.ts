import '../../testEnv'
import test from 'ava'
import { Service } from '../../typings/Service'
import { noBot, startBot } from './startBot'
// `import = require` keeps the module object assignable, so the tests can stub its exports
import botModule = require('./bot')

const config = { botToken: 'token', clientId: 'client' }

function silenceConsole(t: import('ava').ExecutionContext) {
  const { error, log } = console
  console.error = () => undefined
  console.log = () => undefined
  t.teardown(() => {
    console.error = error
    console.log = log
  })
}

test.serial('a started bot is returned', async (t) => {
  silenceConsole(t)
  const bot: Service = { run: async () => undefined, shutdown: async () => undefined }
  botModule.createBot = async () => bot
  t.is(await startBot(config), bot)
})

test.serial(
  'when Discord is unreachable, the server runs without the bot (regression)',
  async (t) => {
    silenceConsole(t)
    botModule.createBot = async () => {
      throw new Error('connect ECONNREFUSED discord.com')
    }
    t.is(await startBot(config), noBot)
  }
)

test.serial(
  'a failed login is cleaned up and the server runs without the bot (regression)',
  async (t) => {
    silenceConsole(t)
    let shutDown = false
    botModule.createBot = async () => ({
      run: async () => {
        throw new Error('An invalid token was provided.')
      },
      shutdown: async () => {
        shutDown = true
      },
    })
    t.is(await startBot(config), noBot)
    t.true(shutDown)
  }
)
