import type { BotCommandHandler } from '../internals'

const handler: BotCommandHandler = async interaction => {
  await interaction.reply({
    content: 'I am a bot!'
  })
}

export default handler
