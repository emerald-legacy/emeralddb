import {
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js'

export interface Config {
  botToken: string
  clientId: string
}

export interface Command {
  name: string
  // Only what registerCommands needs from a SlashCommandBuilder
  command: { toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody }
  handler(interaction: ChatInputCommandInteraction): Promise<unknown>
}

export interface CardInput {
  id: string
  name: string
  name_extra?: string
}

export interface CardPackInput {
  card_id: string
  image_url?: string
}

export interface RulingInput {
  id: number
  text: string
  // Optional for data admins: empty or missing in the database
  source?: string | null
  link?: string | null
}

export interface CachedCard {
  image: string
  id: string
  name: string
}
