import { stripIndent } from 'common-tags'
import { prisma } from 'db'

import { isRoleManager } from '../guards/permission.js'
import { BotCommandHandler } from '../internals'

const handler: BotCommandHandler = async interaction => {
  if (!interaction.inGuild()) return interaction.reply({ content: 'Command must be run in guild' })
  if (!isRoleManager(interaction))
    return interaction.reply({ content: 'You do not have permission to use this command' })
  await interaction.deferReply()

  try {
    const groups = await prisma.roleGroups.findMany({
      where: {
        guildId: interaction.guildId
      },
      select: {
        groupId: true,
        groupName: true,
        buttons: {
          select: {
            buttonLabel: true,
            roleId: true
          }
        }
      }
    })

    if (groups.length === 0) {
      await interaction.editReply(
        stripIndent`
          There are no role groups in this server.
          Make one by using \`/creategroup\` or apply a \`/preset\` to get started fast!
        `
      )
    } else {
      let groupsList = '```ansi\n'
      groups.forEach(g => {
        groupsList += `[1;33m${g.groupName}[0m (ID ${g.groupId})\n`

        if (g.buttons.length > 0) {
          g.buttons.forEach(b => {
            groupsList += `‣ [0;33m${b.buttonLabel}[0m - <@&${b.roleId}>\n`
          })
        } else {
          groupsList += `‣ No roles assigned to this group\n`
        }

        groupsList += `\n`
      })
      groupsList += '```'

      await interaction.editReply(`There are ${groups.length} groups in this guild:\n${groupsList}`)
    }
  } catch (e) {
    await interaction.editReply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
  }
}

export default handler
