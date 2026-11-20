import { Command } from './types'

// What runCommand needs from an interaction; a ChatInputCommandInteraction has it all
export interface ReplyableInteraction {
  replied: boolean
  deferred: boolean
  reply(options: { content: string; ephemeral: boolean }): Promise<unknown>
  followUp(options: { content: string; ephemeral: boolean }): Promise<unknown>
}

const SORRY = {
  content: 'Sorry, something went wrong. Please try again later.',
  ephemeral: true,
}

/**
 * Runs a bot command. The bot runs in the same process as the API, so an error must never
 * escape: it is logged and the user gets a short reply instead.
 */
export async function runCommand<Interaction extends ReplyableInteraction>(
  command: Pick<Command, 'name'> & { handler(interaction: Interaction): Promise<unknown> },
  interaction: Interaction
): Promise<void> {
  try {
    await command.handler(interaction)
  } catch (error) {
    console.error(`BOT: /${command.name} failed`, error)
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(SORRY)
      } else {
        await interaction.reply(SORRY)
      }
    } catch (replyError) {
      console.error(`BOT: could not tell the user that /${command.name} failed`, replyError)
    }
  }
}
