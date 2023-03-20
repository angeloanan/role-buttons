import { stripIndent } from 'common-tags'
import { prisma } from 'db'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js'

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
  if (!isRoleManager(interaction))
    return interaction.reply({ content: 'You do not have permission to use this command' })
  await interaction.deferReply({ ephemeral: true })

  try {
    const groupId = interaction.options.get('group_id', true).value as number
    await interaction.editReply('Command not implemented yet')

    const roleGroup = await prisma.roleGroups.findUnique({
      where: {
        groupId
      },
      select: {
        buttons: {
          select: {
            roleId: true
          }
        },
        groupName: true,
        guildId: true
      }
    })

    if (roleGroup == null || roleGroup?.guildId !== interaction.guildId)
      return void (await interaction.editReply({
        content: `Group \`${groupId}\` not found!`
      }))

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`deletegroup:${groupId}`)
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`canceldeletegroup:${groupId}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
    )

    await interaction.editReply({
      content: stripIndent`
        Are you sure that you want to delete the role group \`${roleGroup.groupName}\`?
      `,
      components: [actionRow]
    })
  } catch (e) {
    await interaction.editReply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
  }
}

export default handler
