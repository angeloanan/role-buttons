import { ModalActionRowComponentBuilder, ModalBuilder } from '@discordjs/builders'
import { prisma } from 'db'
import { ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

import { isRoleManager } from '../guards/permission.js'
import { BotCommandAutocompleteHandler, BotCommandHandler } from '../internals'

export const autocomplete: BotCommandAutocompleteHandler = async interaction => {
  if (!interaction.inGuild()) return interaction.respond([])

  const roleGroups = await prisma.roleGroups.findMany({
    where: {
      guildId: interaction.guildId
    },
    select: {
      groupId: true,
      groupName: true
    }
  })

  await interaction.respond(roleGroups.map(g => ({ name: g.groupName, value: g.groupId })))
}

const handler: BotCommandHandler = async interaction => {
  if (!interaction.channel) return
  if (!isRoleManager(interaction))
    return interaction.reply({ content: 'You do not have permission to use this command' })

  try {
    // TODO: Migrate to modals once released to djs
    const groupId = interaction.options.get('group_id', true).value as number

    const roleGroup = await prisma.roleGroups.findUnique({
      where: {
        groupId
      },
      select: {
        groupLabel: true,
        groupName: true,
        guildId: true
      }
    })

    if (roleGroup == null || roleGroup?.guildId !== interaction.guildId)
      return void (await interaction.reply({
        content: `Group \`${groupId}\` not found!`
      }))

    const modal = new ModalBuilder()
      .setCustomId(`editGroup:${groupId}`)
      .setTitle(`Edit Role Group`)
      .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>()
          .addComponents(
            new TextInputBuilder()
              .setCustomId('groupName')
              .setLabel('Group name')
              .setPlaceholder('My Fancy Roles')
              .setValue(roleGroup.groupName)
              .setStyle(TextInputStyle.Short)
              .setMinLength(2)
              .setMaxLength(72)
              .setRequired(true)
          )
          .toJSON(),
        new ActionRowBuilder<ModalActionRowComponentBuilder>()
          .addComponents(
            new TextInputBuilder()
              .setCustomId('groupLabel')
              .setLabel('Group Label')
              .setPlaceholder('Hear ye! hear ye! Get yar role here!')
              .setValue(roleGroup.groupLabel)
              .setStyle(TextInputStyle.Paragraph)
              .setMinLength(2)
              .setMaxLength(2_000)
              .setRequired(true)
          )
          .toJSON()
      )

    await interaction.showModal(modal)
    const submittedModal = await interaction
      .awaitModalSubmit({
        filter: i => i.customId === `editGroup:${groupId}`,
        time: 5 * 60 * 1000 // 5 Minutes
      })
      .catch(async () => {
        await interaction.reply('Timeout - You took too long to edit the modal!')
        return
      })

    // Landed on .catch before
    if (submittedModal == null) return
    const groupName = submittedModal.fields.getTextInputValue('groupName')
    const groupLabel = submittedModal.fields.getTextInputValue('groupLabel')

    await prisma.roleGroups.update({
      where: {
        groupId
      },
      data: {
        groupName: groupName,
        groupLabel: groupLabel
      }
    })

    await submittedModal.reply({
      content: `Role group \`${roleGroup.groupName}\` has been edited!`
    })
  } catch (e) {
    await interaction.reply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
  }
}

export default handler
