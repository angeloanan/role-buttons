/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ^ Remove this later!
import { OAuth2Scopes } from 'discord.js'

import { client } from '../index'

const handler = () => {
  console.log(`Logged in as ${client?.user?.tag as string}!`)
  console.log(
    client.generateInvite({
      scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
      permissions: ['Administrator', 'SendMessages', 'ManageRoles']
    })
  )
}

export default handler
