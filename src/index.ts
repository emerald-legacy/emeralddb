import 'source-map-support/register'

import createApp from './app'
import { noBot, startBot } from './bot'
import env from './env'
import { Service } from './typings/Service'

async function main() {
  // The API first: the optional bot must not keep it from starting
  const app = await createApp()
  await app.run()

  let bot: Service = noBot
  if (env.discord.isBotEnabled) {
    bot = await startBot(env.discord)
  } else {
    await noBot.run()
  }

  const shutdown = () => {
    app.shutdown()
    bot.shutdown()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('SIGQUIT', shutdown)
}

main().catch((error: unknown) => {
  console.error('SERVER: could not start', error)
  process.exit(1)
})
