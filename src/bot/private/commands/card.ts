import { DiscordAPIError, SlashCommandBuilder } from 'discord.js'
import { search } from '../cardsFuzzySearch'
import { Command } from '../types'
import { listAlternatives } from '../format'

const name = 'card'

export const command: Command = {
  name,
  command: new SlashCommandBuilder()
    .setName(name)
    .setDescription("Replies with the card you're looking for")
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of the card or a part of its name')
        .setRequired(true)
    ),

  async handler(interaction) {
    const query = interaction.options.getString('name')
    if (!query) return

    const result = await search(query)
    try {
      if (result.__tag === 'noMatch') {
        return interaction.reply({
          ephemeral: true,
          content: `I am sorry, but I have no idea what you are looking for`,
        })
      }
      if (result.__tag === 'singleMatch') {
        return interaction.reply(result.card.image)
      }

      const candidates = result.names.map((name) => `\`${name}\``)
      return interaction.reply({
        ephemeral: true,
        content: `I'm not sure I follow you. Are you looking for ${listAlternatives(candidates)}?`,
      })
    } catch (e) {
      if (e instanceof DiscordAPIError) {
        return
      }
      throw e
    }
  },
}
