import { stripIndent } from 'common-tags'
import { prisma } from 'db'
import { Message } from 'discord.js'

import { presetData } from '../../constants/groupPresets'
import type { ButtonInteractionHandler } from '../../internals'

const handler: ButtonInteractionHandler = async interaction => {
  if (!interaction.inGuild() || interaction.guild == null)
    return void (interaction.message as Message).edit('Command must be run in a server')

  const buttonId = interaction.customId
  const buttonArgs = buttonId.split(':')
  const presetId = buttonArgs[1]
  const groupName = buttonArgs[2]
  const guild = await interaction.guild.fetch()
  const originalMsg = interaction.message as Message

  const selectedPreset = presetData.find(p => p.id === presetId)
  if (selectedPreset == null) {
    return void originalMsg.edit(
      `Preset **\`${presetId}\`** has been deleted by the bot developer. Please join the support server to report this issue!`
    )
  }

  await Promise.all([
    originalMsg.edit({
      content: stripIndent`
        Applying preset **\`${selectedPreset.name}\`** to this server
        \`\`\`ansi
        ‣ [1;33mStep 1: Creating server roles...[0m
        ‣ Step 2: Creating role group[0m
        \`\`\`
    `,
      components: []
    }),
    originalMsg.channel.sendTyping()
  ])
  const createdRoles = await Promise.all(
    selectedPreset.roles.map(async r =>
      guild.roles.create({
        name: r.name,
        color: r.roleColor
      })
    )
  )

  await Promise.all([
    originalMsg.edit(
      stripIndent`
      Applying preset **\`${selectedPreset.name}\`** to this server
      \`\`\`ansi
      [0;32mStep 1: Creating server roles[0m
      ‣ [1;33mStep 2: Creating role group...[0m
      \`\`\`
      `
    ),
    prisma.roleGroups.create({
      data: {
        groupName: groupName,
        guildId: guild.id,
        buttons: {
          createMany: {
            data: selectedPreset.roles.map(r => ({
              buttonLabel: r.name,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              roleId: createdRoles.find(cr => cr.name === r.name)!.id
            }))
          }
        }
      }
    })
  ])

  await originalMsg.edit(
    stripIndent`
    Applying preset **\`${selectedPreset.name}\`** to this server
    \`\`\`ansi
    [0;32mStep 1: Creating server roles[0m
    [0;32mStep 2: Creating role group[0m
    \`\`\`
    Done. You can now use **\`${groupName}\`** group in this server!
    `
  )
  originalMsg.channel.sendTyping
}

export default handler
