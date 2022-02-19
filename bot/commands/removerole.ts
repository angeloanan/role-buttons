import { prisma } from 'db'

import { isRoleManager } from '../guards/permission.js'
import { client } from '../index.js'
import { BotCommandAutocompleteHandler, BotCommandHandler } from '../internals'

export const autocomplete: BotCommandAutocompleteHandler = async interaction => {
  if (!interaction.inGuild()) return void interaction.respond([])
  const { name: fieldName } = interaction.options.getFocused(true)
  const guild = await client.guilds.fetch(interaction.guildId)

  switch (fieldName) {
    case 'group_id': {
      const groups = await prisma.roleGroups.findMany({
        where: {
          guildId: guild.id
        },
        select: {
          groupId: true,
          groupName: true
        }
      })

      return await interaction.respond(groups.map(g => ({ name: g.groupName, value: g.groupId })))
    }
    case 'button_label': {
      const groupId = interaction.options.getInteger('group_id')
      if (groupId == null) return void interaction.respond([])

      const roles = await prisma.roleButton.findMany({
        where: {
          roleGroup: {
            guildId: guild.id
          },
          roleGroupId: groupId
        },
        select: {
          roleId: true,
          buttonLabel: true
        }
      })

      return interaction.respond(roles.map(r => ({ name: r.buttonLabel, value: r.buttonLabel })))
    }
    default: {
      await interaction.respond([])
      return
    }
  }
}

const handler: BotCommandHandler = async interaction => {
  if (!interaction.inGuild()) return interaction.reply('Command must be run in a server')
  if (!isRoleManager) return interaction.reply('You do not have permission to use this command')
  await interaction.deferReply()

  const guildId = interaction.guildId
  const groupId = interaction.options.get('group_id', true).value as number
  const role = interaction.options.get('role')?.role
  const label = interaction.options.get('button_label')?.value as string

  try {
    if (role) {
      if (role.name === '@everyone' || role.managed || role.tags != null)
        return void (await interaction.editReply(`Invalid Role: <@&${role.id}>`))
      const deleted = await prisma.roleButton.delete({
        where: {
          roleId: role.id
        },
        select: {
          roleGroup: {
            select: {
              groupName: true
            }
          }
        }
      })
      return void (await interaction.editReply(
        `Removed role <@&${role.id}> (${role.id}) from group ${deleted.roleGroup.groupName} (ID ${groupId})`
      ))
    } else if (label) {
      const deleted = await prisma.roleButton.deleteMany({
        where: {
          roleGroup: {
            guildId: guildId,
            groupId: groupId
          },
          buttonLabel: label
        }
      })
      return void (await interaction.editReply(
        `Removed ${deleted.count} roles from group ID ${groupId}!`
      ))
    } else {
      return void (await interaction.editReply('You must specify either a role or a button label!'))
    }
  } catch (e) {
    await interaction.editReply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
    console.error(e)
  }
}

export default handler
