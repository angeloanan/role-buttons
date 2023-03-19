import { influx, prisma } from 'db'
import { ActionRow, ButtonComponent, ButtonStyle, Util } from 'discord.js'
import type { APIMessageComponentEmoji } from 'discord-api-types'

import { isRoleManager } from '../guards/permission.js'
import type { BotCommandAutocompleteHandler, BotCommandHandler } from '../internals'

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
  await interaction.deferReply({ ephemeral: true })
  if (!isRoleManager(interaction))
    return interaction.reply({ content: 'You do not have permission to use this command' })

  try {
    const groupId = interaction.options.get('group_id', true).value as number
    const roleGroup = await prisma.roleGroups.findUnique({
      where: {
        groupId
      },
      include: {
        buttons: {
          select: {
            roleId: true,
            buttonLabel: true,
            buttonEmoji: true
          },
          orderBy: {
            id: 'asc'
          }
        }
      }
    })

    if (roleGroup == null || roleGroup?.guildId !== interaction.guildId)
      return void (await interaction.editReply({
        content: `Group \`${roleGroup?.groupName ?? groupId}\` not found!`
      }))
    if (roleGroup.buttons?.length === 0)
      return void (await interaction.editReply({
        content: `Group \`${roleGroup.groupName}\` has no roles configured. Add them with \`/addrole\`!`
      }))

    // Create action Rows so that it fits in 5 buttons per row
    const actionRows: ActionRow[] = []
    for (let i = 0; i < Math.ceil(roleGroup.buttons.length / 5); i++) {
      actionRows.push(new ActionRow())
    }

    roleGroup.buttons.forEach((b, index) => {
      const button = new ButtonComponent()
        .setCustomId(`selfrole:${b.roleId}`)
        .setLabel(b.buttonLabel)
        .setStyle(ButtonStyle.Secondary)

      if (b.buttonEmoji != '') {
        button.setEmoji(Util.resolvePartialEmoji(b.buttonEmoji) as APIMessageComponentEmoji)
      }

      actionRows[Math.floor(index / 5)].addComponents(button)
    })

    await interaction.channel?.send({
      content: roleGroup.groupLabel,
      components: actionRows
    })

    await interaction.editReply({ content: `Displayed group \`${roleGroup.groupName}\`!` })

    influx.displayLog(influx.DisplayMode.Add, { serverId: interaction.guildId })
  } catch (e) {
    console.error(e)
    await interaction.editReply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
  }
}

export default handler
