import {
  AutocompleteInteraction,
  ButtonInteraction,
  CacheType,
  CommandInteraction
} from 'discord.js'

export interface BotEventHandler {
  default: () => void | Promise<void>
}

// ---

export interface BotCommand {
  autocomplete: BotCommandAutocompleteHandler
  default: BotCommandHandler
}

export type BotCommandAutocompleteHandler = (
  interaction: AutocompleteInteraction<CacheType>
) => void | Promise<void>
export type BotCommandHandler = (Interaction: CommandInteraction<CacheType>) => any // Type any because don't care return type

// ---

export interface BtnInteraction {
  default: ButtonInteractionHandler
}

export type ButtonInteractionHandler = (interaction: ButtonInteraction) => any // Type any because don't care return type

// ---
