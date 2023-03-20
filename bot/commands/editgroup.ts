import { stripIndent } from 'common-tags'
import { prisma } from 'db'

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
  await interaction.deferReply()

  try {
    // TODO: Migrate to modals once released to djs
    const groupId = interaction.options.get('group_id', true).value as number
    const groupName = interaction.options.get('group_name')?.value as string | undefined
    const groupLabel = interaction.options.get('group_label')?.value as string | undefined

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

    await interaction.editReply({
      content: stripIndent`
        > You are editing group \`${roleGroup.groupName}\`...
        Send a message that will be the role group's display message! (Formatting supported)
      `
    })

    const contentMessage = await interaction.channel.awaitMessages({
      filter: m => {
        console.debug(m.author.id)
        return m.author.id === interaction.user.id
      },
      time: 120_000,
      max: 1,
      errors: ['time']
    })

    await prisma.roleGroups.update({
      where: {
        groupId
      },
      data: {
        groupLabel: contentMessage.first()?.content
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
