import { Client, GatewayIntentBits, REST, Routes } from 'discord.js'

import { Service } from '../../typings/Service'
import { command as cardCommand } from './commands/card'
import { command as rulingsCommand } from './commands/rulings'
import { Config } from './types'
import { runCommand } from './runCommand'

const commands = [cardCommand, rulingsCommand]

async function registerCommands(config: Config): Promise<unknown> {
  const rest = new REST({ version: '10' }).setToken(config.botToken)
  const body = commands.map((command) => command.command.toJSON())
  return rest.put(Routes.applicationCommands(config.clientId), { body })
}

export async function createBot(config: Config): Promise<Service> {
  console.log('BOT: registering commands')
  await registerCommands(config)

  console.log('BOT: initializing bot')
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })

  // Without an 'error' listener, Node ends the process on every client error, API included
  client.on('error', (error) => console.error('BOT: client error', error))

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = commands.find((candidate) => candidate.name === interaction.commandName)
    if (command) {
      await runCommand(command, interaction)
    }
  })

  return {
    async run() {
      await client.login(config.botToken)
      console.log('BOT: running')
    },
    async shutdown() {
      console.log('BOT: shutdown start')
      await client.destroy()
      console.log('BOT: shutdown done')
    },
  }
}
