import { stripIndent } from 'common-tags'
import { prisma } from 'db'
import os from 'node:os'
import { memoryUsage } from 'node:process'

import { client } from '../index.js'
import type { BotCommandHandler } from '../internals'

const handler: BotCommandHandler = async interaction => {
  await interaction.deferReply({ ephemeral: true })

  // TODO: Cache these values
  const guildCount =
    (await client.shard?.fetchClientValues('guilds.cache.size')) ?? client.guilds.cache.size
  const memberCount =
    (await client.shard?.fetchClientValues('users.cache.size')) ?? client.users.cache.size

  const roleGroupsCount = await prisma.roleGroups.count()
  const roleButtonsCount = await prisma.roleGroups.count()

  await interaction.editReply({
    content: '\u200B',
    embeds: [
      {
        author: {
          name: 'Role Buttons',
          icon_url: client.user?.displayAvatarURL({ forceStatic: true })
        },
        description:
          'Role Button bot lets your server members choose roles with customizable buttons!',
        color: 0xffffff,

        fields: [
          {
            name: 'Using the bot',
            value: stripIndent`
              **1.** Create a role group with **\`/creategroup\`**
              **2.** Add roles to the role group with **\`/addrole\`**
              **3.** Display the role group using **\`/display\`**
            `
          },
          {
            name: 'Presets',
            value: stripIndent`
              To make it easy to setup roles, we have included a few preset role groups.
              You can apply these presets by using **\`/preset\`**
            `
          },

          {
            name: '📊 Live Statistics',
            value: stripIndent`
              • Serving ${memberCount} users in ${guildCount} servers
              • Tracking ${roleButtonsCount} buttons assigned to ${roleGroupsCount} groups
            `,
            inline: true
          },
          {
            name: '🖥️ Host Statistics',
            value: stripIndent`
              • Running ${os.cpus()[0].model} with ${os.cpus().length} threads
              • ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB of RAM (Using ${(
              memoryUsage.rss() /
              1024 /
              1024
            ).toPrecision(2)} MB)
            `,
            inline: true
          },
          {
            name: 'ℹ Extra Info',
            value: stripIndent`
              • **[Join the support server](https://discord.gg/VyZduSGhjk)**
              • [Use the online dashboard for easier configuration](https://rolebuttons.angelo.fyi) (Work In Progress!)
              • [Support the creator here](https://angeloanan.xyz)
            `,
            inline: false
          }
        ]
      }
    ]
  })
}

export default handler
