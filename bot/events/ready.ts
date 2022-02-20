/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ^ Remove this later!
import { influx } from 'db'
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

  setInterval(() => {
    influx.gatewayPingLog(client.ws.ping)
  }, 15000)
}

export default handler
