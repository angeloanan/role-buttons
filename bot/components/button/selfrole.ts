import { influx } from 'db'
import type { DiscordAPIError, GuildMemberRoleManager } from 'discord.js'

import type { ButtonInteractionHandler } from '../../internals'

const handler: ButtonInteractionHandler = async interaction => {
  const buttonId = interaction.customId
  const buttonArgs = buttonId.split(':')
  const roleId = buttonArgs[1]
  const memberRoles = interaction.member?.roles as GuildMemberRoleManager

  try {
    if (memberRoles.cache.has(roleId)) {
      await memberRoles.remove(roleId)
      await interaction.reply({
        content: `You no longer have <@&${roleId}>!`,
        ephemeral: true
      })

      influx.roleAssignLog(influx.RoleAssignMode.Remove, {
        serverId: interaction.guildId as string
      })
    } else {
      await memberRoles.add(roleId)
      await interaction.reply({
        content: `You now have <@&${roleId}>!`,
        ephemeral: true
      })

      influx.roleAssignLog(influx.RoleAssignMode.Add, {
        serverId: interaction.guildId as string
      })
    }
  } catch (e) {
    if ((e as DiscordAPIError).message === 'Unknown Role') {
      await interaction.reply({
        content: `This role was deleted. Please notify the server administrator that this role were deleted!`,
        ephemeral: true
      })
      return
    }

    await interaction.reply({
      content: `An internal error has occurred:\`\`\`${e as string}\`\`\``,
      ephemeral: true
    })
    console.error(e)
  }
}

export default handler
