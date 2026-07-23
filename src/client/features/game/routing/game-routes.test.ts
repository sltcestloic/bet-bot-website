import { describe, expect, it } from 'vitest'

import { getGameGuildDestination, getLegacyGameDestination } from '@/client/features/game/routing/game-routes'

describe('game routes', () => {
  it.each([
    ['/dashboard/42/overview', '/app/42/profile'],
    ['/dashboard/42/history?season=3', '/app/42/tickets?season=3'],
    ['/dashboard/42/leaderboards', '/app/42/leaderboard'],
    ['/dashboard/42/performance?season=3', '/app/42/stats?season=3&tab=performance'],
    ['/dashboard/42/sports', '/app/42/stats?tab=affinities'],
    ['/dashboard/42/economy', '/app/42/stats?tab=economy'],
    ['/dashboard/42/activity', '/app/42/stats?tab=activity'],
    ['/dashboard/42/players/7', '/app/42/players/7'],
  ])('maps %s to %s', (legacy, expected) => {
    expect(getLegacyGameDestination(legacy)).toBe(expected)
  })

  it('keeps the equivalent section when changing guilds', () => {
    expect(getGameGuildDestination('/app/old/tickets', '?view=active', 'old', 'new')).toBe('/app/new/tickets?view=active')
  })

  it('falls back to the profile when changing guilds from a public player', () => {
    expect(getGameGuildDestination('/app/old/players/7', '', 'old', 'new')).toBe('/app/new/profile')
  })
})
