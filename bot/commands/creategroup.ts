import { stripIndent } from 'common-tags'
import { prisma } from 'db'

import { isRoleManager } from '../guards/permission.js'
import { BotCommandHandler } from '../internals'

const handler: BotCommandHandler = async interaction => {
  if (!interaction.inGuild()) return interaction.reply('Command must be run in guild')
  if (!isRoleManager(interaction))
    return interaction.reply('You do not have permission to use this command')
  await interaction.deferReply()

  try {
    const groupName = interaction.options.get('group_name', true).value as string

    const roleGroupsCount = await prisma.roleGroups.aggregate({
      where: {
        guildId: interaction.guildId
      },
      _count: true
    })

    if (roleGroupsCount._count > 25) {
      return void (await interaction.editReply({
        content: 'You have reached the maximum number of groups'
      }))
    }

    await prisma.roleGroups.create({
      data: {
        groupName,
        guild: {
          connectOrCreate: {
            create: {
              id: interaction.guildId
            },
            where: {
              id: interaction.guildId
            }
          }
        }
      }
    })

    await interaction.editReply({
      content: stripIndent`
        > Group **\`${groupName}\`** has been created
        You can now add roles to the group by using \`/addrole\`!
      `
    })
  } catch (e) {
    await interaction.editReply({
      content: `> Something went wrong:\`\`\`${e as string}\`\`\``
    })
  }
}

export default handler
