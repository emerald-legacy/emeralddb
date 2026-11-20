import { Service } from '../../typings/Service'
import { createBot } from './bot'
import { Config } from './types'

export const noBot: Service = {
  async run() {
    console.log('BOT: skip')
  },
  async shutdown() {
    console.log('BOT: skip shutdown')
  },
}

/**
 * Starts the Discord bot. It is optional: if Discord can't be reached or the token is
 * wrong, the error is logged and the server keeps running without the bot.
 */
export async function startBot(config: Config): Promise<Service> {
  let bot: Service | undefined
  try {
    bot = await createBot(config)
    await bot.run()
    return bot
  } catch (error) {
    console.error('BOT: could not start, running without it', error)
    await bot?.shutdown().catch(() => undefined)
    return noBot
  }
}
