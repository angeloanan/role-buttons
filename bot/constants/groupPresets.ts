import type { ColorResolvable } from 'discord.js'

export interface RoleGroupPreset {
  id: string
  name: string
  description?: string

  roles: {
    name: string
    roleColor?: ColorResolvable

    buttonEmoji?: string
    buttonLabel?: string
  }[]
}

export const presetData: ReadonlyArray<RoleGroupPreset> = [
  {
    id: 'pronouns',
    name: 'Pronouns (he/they/she/ask)',

    roles: [
      {
        name: 'he / him',
        buttonEmoji: '<:hehim:944722193152094258>'
      },
      {
        name: 'they / them',
        buttonEmoji: '<:theythem:944722215730044940>'
      },
      {
        name: 'she / her',
        buttonEmoji: '<:sheher:944722169945030726>'
      },
      {
        name: 'Ask me'
      }
    ]
  },

  {
    id: 'pingable',
    name: 'Pingable roles (Announcements, Giveaway, etc)',
    roles: [
      {
        name: 'Announcements',
        buttonEmoji: '📢'
      }
    ]
  },

  {
    id: 'colors',
    name: 'Color Roles',

    // Tailwind Colors - https://tailwindcss.com/docs/customizing-colors
    roles: [
      {
        name: 'Red',
        roleColor: 0xef4444
      },
      {
        name: 'Orange',
        roleColor: 0xf97316
      },
      {
        name: 'Yellow',
        roleColor: 0xeab308
      },
      {
        name: 'Green',
        roleColor: 0x22c55e
      },
      {
        name: 'Blue',
        roleColor: 0x3b82f6
      },
      {
        name: 'Purple',
        roleColor: 0xa855f7
      },
      {
        name: 'Pink',
        roleColor: 0xec4899
      }
    ]
  },
  {
    id: 'colors_extended',
    name: 'Color Roles (Extended palette)',

    // Tailwind Colors - https://tailwindcss.com/docs/customizing-colors
    // Limited to 15 colors because of Discord's color limit
    roles: [
      {
        name: 'Red',
        roleColor: 0xef4444
      },
      {
        name: 'Orange',
        roleColor: 0xf97316
      },
      {
        name: 'Amber',
        roleColor: 0xf59e0b
      },
      {
        name: 'Yellow',
        roleColor: 0xeab308
      },
      {
        name: 'Lime',
        roleColor: 0x84cc16
      },
      {
        name: 'Green',
        roleColor: 0x22c55e
      },
      {
        name: 'Emerald',
        roleColor: 0x10b981
      },
      // {
      //   name: 'Teal',
      //   roleColor: 0x14b8a6
      // },
      {
        name: 'Cyan',
        roleColor: 0x06b6d4
      },
      {
        name: 'Sky',
        roleColor: 0x0ea5e9
      },
      {
        name: 'Blue',
        roleColor: 0x3b82f6
      },
      {
        name: 'Indigo',
        roleColor: 0x6366f1
      },
      // {
      //   name: 'Violet',
      //   roleColor: 0x8b5cf6
      // },
      {
        name: 'Purple',
        roleColor: 0xa855f7
      },
      {
        name: 'Fuchsia',
        roleColor: 0xd946ef
      },
      {
        name: 'Pink',
        roleColor: 0xec4899
      },
      {
        name: 'Rose',
        roleColor: 0xf43f5e
      }
    ]
  }
]
