import { influx, prisma } from 'db'
import type { Guild } from 'discord.js'

import { client } from '../index.js'

const handler = async (guild: Guild) => {
  // Create guild on first join
  try {
    await prisma.guild.create({
      data: {
        id: guild.id
      }
    })

    const guildCount = (
      ((await client.shard?.fetchClientValues('guilds.cache.size')) as number[]) ?? [
        client.guilds.cache.size
      ]
    ).reduce((p, c) => p + c, 0)

    influx.guildCountLog(guildCount)
  } catch (e) {
    console.error(
      'Failed to create guild data on Database. Is the guild already in the database?',
      e
    )
  }
}

export default handler
