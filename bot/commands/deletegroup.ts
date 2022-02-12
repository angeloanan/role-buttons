import { prisma } from 'db'
import { ActionRow, ButtonComponent, ButtonStyle } from 'discord.js'

import { isRoleManager } from '../guards/permission'
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

    //   const roleGroup = await prisma.roleGroups.findUnique({
    //     where: {
    //       groupId
    //     },
    //     include: {
    //       buttons: true
    //     }
    //   })

    //   if (roleGroup == null || roleGroup?.guildId !== interaction.guildId)
    //     return void (await interaction.editReply({
    //       content: `Group \`${roleGroup?.groupName ?? groupId}\` not found!`
    //     }))
    //   if (roleGroup.buttons.length === 0)
    //     return void (await interaction.editReply({
    //       content: `Group \`${roleGroup.groupName}\` has no roles configured. Add them with \`/addrole\`!`
    //     }))

    //   const actionRow = new ActionRow()
    //   roleGroup?.buttons.map(b =>
    //     actionRow.addComponents(
    //       new ButtonComponent()
    //         .setCustomId(`selfrole:${b.roleId}`)
    //         .setLabel(b.buttonLabel)
    //         .setStyle(ButtonStyle.Secondary)
    //     )
    //   )

    //   await interaction.channel?.send({
    //     content: 'Get your role here!',
    //     components: [actionRow]
    //   })

    //   await interaction.editReply({ content: `Displayed group \`${roleGroup.groupName}\`!` })
  } catch (e) {
    await interaction.editReply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
  }
}

export default handler
