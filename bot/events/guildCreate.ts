import { prisma } from 'db'
import type { Guild } from 'discord.js'

const handler = async (guild: Guild) => {
  // Create guild on first join
  try {
    await prisma.guild.create({
      data: {
        id: guild.id
      }
    })
  } catch (e) {
    console.error(
      'Failed to create guild data on Database. Is the guild already in the database?',
      e
    )
  }
}

export default handler
