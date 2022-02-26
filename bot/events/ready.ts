import { influx, prisma } from 'db'
import { ActivityType, OAuth2Scopes } from 'discord.js'

import { client } from '../index.js'

const handler = () => {
  console.log(`Logged in as ${client?.user?.tag as string}!`)
  console.log(
    client.generateInvite({
      scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
      permissions: ['Administrator', 'SendMessages', 'ManageRoles']
    })
  )

  client.user?.setStatus('online')
  client.user?.setActivity({
    name: 'for buttons • /about',
    type: ActivityType.Watching
  })

  client.on('raw', e => {
    try {
      influx.gatewayEventsLog(e.t, e.s)
    } catch (e) {
      console.error(e)
      client.removeAllListeners('raw')
    }
  })

  setInterval(() => {
    influx.gatewayPingLog(client.ws.ping)
  }, 15000)

  const logPrismaLatency = async () => {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const end = Date.now()
    influx.databasePingLog(end - start)
  }

  setInterval(() => {
    void logPrismaLatency()
  }, 15000)
}

export default handler
