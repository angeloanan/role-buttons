import { prisma } from 'db'
import type { Guild } from 'discord.js'

const handler = async (guild: Guild) => {
  await prisma.guild.delete({
    where: {
      id: guild.id
    }
  })
}

export default handler
