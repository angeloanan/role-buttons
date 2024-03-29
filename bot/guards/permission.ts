import { BaseInteraction, CommandInteraction, Interaction, PermissionsBitField } from 'discord.js'

const isRoleManager = (interaction: BaseInteraction) => {
  if (!interaction.inGuild()) return false

  const p = interaction.member.permissions as PermissionsBitField
  return p.has('ManageRoles') || p.has('Administrator')
}

export { isRoleManager }
