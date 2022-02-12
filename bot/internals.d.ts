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
export type BotCommandHandler = (Interaction: CommandInteraction<CacheType>) => void | Promise<void>

// ---

export interface BtnInteraction {
  default: ButtonInteractionHandler
}

export type ButtonInteractionHandler = (interaction: ButtonInteraction) => void | Promise<void>

// ---
