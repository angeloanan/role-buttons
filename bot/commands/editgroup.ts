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
      return void (await interaction.editReply({
        content: `Group \`${groupId}\` not found!`
      }))

    const modal = new ModalBuilder()
      .setCustomId(`editGroup:${groupId}`)
      .setTitle(`Editing Role Group "${roleGroup.groupName}"`)
      .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('groupName')
            .setLabel('Group name')
            .setPlaceholder('Your role group name...')
            .setValue(roleGroup.groupName)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        ),
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('groupLabel')
            .setLabel('Group Label')
            .setPlaceholder('Get your role here!')
            .setValue(roleGroup.groupLabel)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
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

    await interaction.channel.send({ content: `Edited role group \`${roleGroup.groupName}\`!` })
  } catch (e) {
    await interaction.editReply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
  }
}

export default handler
