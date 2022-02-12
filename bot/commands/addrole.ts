import { stripIndent } from 'common-tags'
import { prisma } from 'db'
import type { Role } from 'discord.js'

import { isRoleManager } from '../guards/permission'
import { BotCommandAutocompleteHandler, BotCommandHandler } from '../internals'

export const autocomplete: BotCommandAutocompleteHandler = async interaction => {
  if (!interaction.inGuild()) return void interaction.respond([])

  try {
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
  } catch (e) {
    console.error('ADDROLE_AUTOCOMPLETE_ERROR', e)
    await interaction.respond([])
  }
}

const handler: BotCommandHandler = async interaction => {
  if (!interaction.inGuild()) return interaction.reply('Command must be run in guild')
  if (!isRoleManager) return

  const groupId = interaction.options.get('group_id', true).value as number
  const role = interaction.options.get('role', true).role as Role
  const label = interaction.options.get('button_label')?.value as string
  if (label && label.length > 80)
    return interaction.reply('Button label must be 80 characters or less')

  await interaction.deferReply()

  try {
    if (role.name === '@everyone')
      return void (await interaction.editReply({
        content: 'You cannot add @everyone to a group!'
      }))
    if (role.managed || role.tags != null)
      return void (await interaction.editReply(
        `Role <@&${role.id}> is either an integration or a booster role and can't be added as a self-assignable role!`
      ))

    const roleAlreadyAssigned = await prisma.roleButton.findUnique({
      where: {
        roleId: role.id
      },
      include: {
        roleGroup: true
      },
      rejectOnNotFound: false
    })

    if (roleAlreadyAssigned) {
      return void interaction.editReply(stripIndent`
        Role <@&${role.id}> can't be re-assigned as it already assigned to group \`${roleAlreadyAssigned.roleGroup.groupName}\`.
        You might want to \`/removerole\` the role from the group first!
      `)
    }

    const group = await prisma.roleGroups.update({
      where: {
        groupId: groupId
      },
      data: {
        buttons: {
          create: {
            roleId: role.id,
            buttonLabel: label ?? role.name
          }
        }
      }
    })

    await interaction.editReply(`Added role <@&${role.id}> to group \`${group.groupName}\`!`)
  } catch (e) {
    await interaction.editReply({
      content: `Something went wrong:\`\`\`${e as string}\`\`\``
    })
    console.error(e)
  }
}

export default handler
