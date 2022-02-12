import { prisma } from 'db'
import type { Role } from 'discord.js'

const handler = async (role: Role) => {
  // Handle role deletion, if a button exist for the role, notify owner
  if (role.managed || role.tags != null) return
  const button = await prisma.roleButton.findUnique({
    where: {
      roleId: role.id
    },
    include: {
      roleGroup: true
    },
    rejectOnNotFound: false
  })
  if (button == null) return

  const ownerDm = await (await role.guild.fetchOwner({ force: true })).createDM()
  const targetChannel =
    role.guild.publicUpdatesChannel ??
    role.guild.systemChannel ??
    role.guild.rulesChannel ??
    ownerDm

  await prisma.roleButton.delete({
    where: {
      roleId: role.id
    }
  })

  await targetChannel.send(
    `**⚠️ WARNING** - Role <@&${role.id}> (\`${role.name}\`) was deleted but it is a part of the button role group \`${button.roleGroup.groupName}\`.
The role has been automatically removed from the group. You might want to re-\`/display\` the button group!`
  )
}

export default handler
