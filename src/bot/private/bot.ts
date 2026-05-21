import { REST } from '@discordjs/rest'
import { Client, GatewayIntentBits } from 'discord.js'
import { Routes } from 'discord-api-types/v10'

import { Service } from '../../typings/Service'
import { command as cardCommand } from './commands/card'
import { command as rulingsCommand } from './commands/rulings'
import { Config } from './types'

async function registerCommands(config: Config): Promise<unknown> {
  const rest = new REST({ version: '10' }).setToken(config.botToken)
  const body = [cardCommand.command, rulingsCommand.command].map((command) => command.toJSON())
  return rest.put(Routes.applicationCommands(config.clientId), { body })
}

export async function createBot(config: Config): Promise<Service> {
  console.log('BOT: registering commands')
  await registerCommands(config)

  console.log('BOT: initializing bot')
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return

    switch (interaction.commandName) {
      case cardCommand.name:
        return cardCommand.handler(interaction)
      case rulingsCommand.name:
        return rulingsCommand.handler(interaction)
    }
  })

  return {
    async run() {
      await client.login(config.botToken)
      console.log('BOT: running')
    },
    async shutdown() {
      console.log('BOT: shutdown start')
      client.destroy()
      console.log('BOT: shutdown done')
    },
  }
}
