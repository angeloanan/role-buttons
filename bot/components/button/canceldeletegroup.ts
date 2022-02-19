import { stripIndent } from 'common-tags'
import type { GuildMember, Message } from 'discord.js'

import { isRoleManager } from '../../guards/permission.js'
import type { ButtonInteractionHandler } from '../../internals'

const handler: ButtonInteractionHandler = async interaction => {
  if (!isRoleManager(interaction)) {
    return interaction.reply({
      content: 'You do not have permission to do this!',
      ephemeral: true
    })
  }

  await (interaction.message as Message).edit({
    content: stripIndent`
      <@${(interaction.member as GuildMember).user.id}> has cancelled the deletion of role group!
    `,
    components: []
  })
}

export default handler
