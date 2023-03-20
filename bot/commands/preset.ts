import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonStyle
} from 'discord.js'

import { presetData } from '../constants/groupPresets.js'
import { isRoleManager } from '../guards/permission.js'
import type { BotCommandAutocompleteHandler, BotCommandHandler } from '../internals'

const presetAutocomplete = presetData.map(p => ({ name: p.name, value: p.name }))

export const autocomplete: BotCommandAutocompleteHandler = async interaction => {
  if (!interaction.inGuild()) return void interaction.respond([])

  return await interaction.respond(presetAutocomplete)
}

const handler: BotCommandHandler = async interaction => {
  if (!interaction.inGuild()) return interaction.reply('Command must be run in a server')
  if (!isRoleManager) return interaction.reply('You do not have permission to use this command')
  await interaction.deferReply()

  const presetId = interaction.options.get('preset_id', true).value as string
  let groupName = interaction.options.get('group_name')?.value as string
  if (!presetData.some(p => p.name === presetId)) {
    return void (await interaction.editReply(`Preset **\`${presetId}\`** not found!`))
  }

  // Already know that `presetData.some` returns true
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const selectedPreset = presetData.find(p => p.name === presetId)!
  groupName ??= selectedPreset.name

  let respondMsg = `You are about to apply role preset **\`${selectedPreset.name}\`** to this server. This will create a role group with the following structure:\n`
  respondMsg += `\`\`\`ansi\n`
  respondMsg += `[1;33m${groupName}[0m\n`
  selectedPreset.roles.forEach(r => (respondMsg += `‣ ${r.name}\n`))
  respondMsg += `\`\`\`\n`
  respondMsg += `Do you still want to continue? **This will create ${selectedPreset.roles.length} new roles**.`

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`applypreset:${selectedPreset.id}:${groupName}`)
      .setEmoji({
        name: '✔'
      })
      .setLabel('Apply Preset')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`cancelpreset`)
      .setEmoji({
        name: '❎'
      })
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger)
  )

  return void (await interaction.editReply({
    content: respondMsg,
    components: [row]
  }))
}

export default handler
