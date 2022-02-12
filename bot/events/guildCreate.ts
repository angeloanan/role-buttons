import { prisma } from 'db'
import type { Guild } from 'discord.js'

const handler = async (guild: Guild) => {
  // Create guild on first join
  await prisma.guild.create({
    data: {
      id: guild.id
    }
  })
}

export default handler
