import { influx, prisma } from 'db'

import { isRoleManager } from '../../guards/permission.js'
import type { ButtonInteractionHandler } from '../../internals'

// Format: deletegroup:<GROUP_ID>
const handler: ButtonInteractionHandler = async interaction => {
  if (!isRoleManager(interaction)) {
    return interaction.reply({
      content: 'You do not have permission to do this!',
      ephemeral: true
    })
  }

  const buttonId = interaction.customId
  const buttonArgs = buttonId.split(':')
  const groupId = parseInt(buttonArgs[1])

  try {
    if (isNaN(groupId)) throw 'Group ID not found'

    await prisma.roleGroups.delete({
      where: {
        groupId
      }
    })

    await interaction.editReply({
      content: 'Group deleted! You might still want to delete individual role group displays.'
    })

    influx.roleGroupLog(influx.RoleGroupMode.Remove, { serverId: interaction.guildId as string })
  } catch (e) {
    await interaction.reply({
      content: `An internal error has occurred:\`\`\`${e as string}\`\`\``,
      ephemeral: true
    })
    console.error(e)
  }
}

export default handler
