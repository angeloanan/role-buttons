import { influx, prisma } from 'db'
import type { Guild } from 'discord.js'

import { client } from '../index.js'

const handler = async (guild: Guild) => {
  try {
    await prisma.guild.delete({
      where: {
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
      'Failed to delete guild data on Database. Is the guild already deleted in the database?',
      e
    )
  }
}

export default handler
