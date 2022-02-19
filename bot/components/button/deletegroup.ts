import { prisma } from 'db'
import type { DiscordAPIError } from 'discord.js'

import type { ButtonInteractionHandler } from '../../internals'

// Format: deletegroup:<GROUP_ID>
const handler: ButtonInteractionHandler = async interaction => {
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
