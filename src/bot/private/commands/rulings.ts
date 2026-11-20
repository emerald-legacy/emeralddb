import { DiscordAPIError, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getAllRulingsForCard } from '../../../gateways/storage'
import { search } from '../cardsFuzzySearch'
import { CachedCard, Command, RulingInput } from '../types'
import { listAlternatives } from '../format'

const name = 'rulings'

function color(ruling: RulingInput): number {
  switch (ruling.source) {
    case 'Developer ruling':
      return 0x0000ff // Blue
    default:
      return 0x00ff00 // Green
  }
}

const links = /\[([^\]]+)]\([^)]+\)/g // Matches `[some text](some link)` and captures `some text`
function formatRulingText(rawText: string): string {
  return rawText.replace(links, (_, text: string) => `\`${text}\``).trim()
}

function truncate(n: number, str: string): string {
  if (str.length <= n) {
    return str
  }
  const subString = str.substring(0, n - 1)
  return subString.substring(0, subString.lastIndexOf(' ')) + '…'
}

// Discord rejects an embed whose URL isn't an http(s) URL
function isWebLink(link: string | null | undefined): link is string {
  if (!link) {
    return false
  }
  try {
    const { protocol } = new URL(link)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * The link and the source of a ruling are optional; an empty one would make the embed
 * invalid, so they are left out.
 *
 * @see https://discordjs.guide/popular-topics/embeds.html#embed-limits
 */
export const toEmbed =
  (card: CachedCard) =>
  (ruling: RulingInput): EmbedBuilder => {
    const embed = new EmbedBuilder()
      .setColor(color(ruling))
      .setAuthor({
        name: truncate(256, card.name),
        url: `https://www.emeralddb.org/card/${card.id}`,
      })
      .setTitle(truncate(256, `Rulling #${ruling.id}`))
      .setThumbnail(card.image)
      .setDescription(truncate(4096, formatRulingText(ruling.text)))
    if (isWebLink(ruling.link)) {
      embed.setURL(ruling.link)
    }
    if (ruling.source) {
      embed.setFooter({ text: truncate(2048, ruling.source) })
    }
    return embed
  }

export const command: Command = {
  name,
  command: new SlashCommandBuilder()
    .setName(name)
    .setDescription("Replies with rulings for the card you're looking for")
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
      if (result.__tag === 'multiMatch') {
        const candidates = result.names.map((name) => `\`${name}\``)
        return interaction.reply({
          ephemeral: true,
          content: `I'm not sure I follow you. Are you looking for ${listAlternatives(
            candidates
          )}?`,
        })
      }

      const rulings = await getAllRulingsForCard(result.card.id)
      if (rulings.length === 0) {
        return interaction.reply({
          ephemeral: true,
          content: `There are no rulings for ${result.card.name} yet.`,
        })
      }
      /**
       * We're sending each ruling as a separate reply using embeds.
       *
       * The embeds look nice and keep the replies clean, but each embed has a
       * char count limit, and a reply with multiple embed have yet another char
       * limit for the combioned embeds. That's why we put one embed per reply.
       *
       * Each interaction can get only one reply, but infinite `followUps`
       */
      const [firstEmbed, ...followUpEmbeds] = rulings.map(toEmbed(result.card))
      await interaction.reply({ embeds: [firstEmbed] })
      await Promise.all(followUpEmbeds.map((embed) => interaction.followUp({ embeds: [embed] })))
    } catch (e) {
      if (e instanceof DiscordAPIError) {
        return
      }
      throw e
    }
  },
}
