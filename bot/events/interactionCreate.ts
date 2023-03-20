import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CacheType, Interaction } from 'discord.js'

import type { BotCommand, BtnInteraction } from '../internals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// TODO: Import once, put on a Collection, call from there

const handler = async (interaction: Interaction) => {
  console.log(`[INTERACTION_CREATE] ${interaction.id} - ${interaction.type}`)
  if (interaction.isMessageComponent()) {
    if (interaction.isButton()) {
      const buttonSignature = interaction.customId.split(':')[0]
      const handler = (await import(
        path.join(__dirname, '..', 'components', 'button', buttonSignature + '.js')
      )) as BtnInteraction
      await handler.default(interaction)?.catch(console.error)
    }
  } else if (interaction.isAutocomplete()) {
    const handler = (await import(
      path.join(__dirname, '..', 'commands', interaction.commandName + '.js')
    )) as BotCommand
    await handler.autocomplete?.(interaction)?.catch(console.error)
  } else if (interaction.isCommand()) {
    const handler = (await import(
      path.join(__dirname, '..', 'commands', interaction.commandName + '.js')
    )) as BotCommand
    await handler.default(interaction)?.catch(console.error)
  }
}

export default handler
