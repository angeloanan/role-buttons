import 'dotenv/config'

import { influx, prisma } from 'db'
import type { ClientEvents } from 'discord.js'
import { Client } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { BotEventHandler } from './internals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const client = new Client({ intents: ['Guilds'] })

// Entry point to mount everything
// TODO: Figure out a better way to do this
client.once('debug', async () => {
  const eventsName = fs.readdirSync(path.join(__dirname, 'events'), { withFileTypes: false })
  for (const eventName of eventsName) {
    const eventHandler = (await import(`./events/${eventName as string}`)) as BotEventHandler
    client.on(path.parse(eventName as string).name as keyof ClientEvents, eventHandler.default)
  }
})

client.on('raw', () => {
  influx.gatewayEventsLog()
})

// Handle graceful exit
process.on('SIGUSR2', () => {
  console.log('[nodemon] restarting process, shutting down gracefully')
  client.destroy()
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  client.destroy()
})

prisma.$connect().catch(console.error)
client.login(process.env.DISCORD_BOT_TOKEN).catch(console.error)

export { client }
