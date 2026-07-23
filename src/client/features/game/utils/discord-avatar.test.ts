import { describe, expect, it } from 'vitest'

import { getDiscordAvatarUrl } from '@/client/features/game/utils/discord-avatar'

describe('getDiscordAvatarUrl', () => {
  it('uses a custom Discord avatar when a hash is available', () => {
    expect(getDiscordAvatarUrl('1010998423178203156', 'custom-avatar')).toBe(
      'https://cdn.discordapp.com/avatars/1010998423178203156/custom-avatar.png?size=128',
    )
  })

  it('uses the deterministic Discord default avatar without a hash', () => {
    expect(getDiscordAvatarUrl('2', null)).toBe('https://cdn.discordapp.com/embed/avatars/0.png')
  })
})
