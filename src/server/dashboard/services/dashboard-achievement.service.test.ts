import { describe, expect, it, vi } from 'vitest'

import { DashboardAchievementService } from '@/server/dashboard/services/dashboard-achievement.service'

describe('DashboardAchievementService', () => {
  it('initializes historical records without celebrating them', async () => {
    const store = { find: vi.fn().mockResolvedValue([]), save: vi.fn(async value => value), update: vi.fn() }
    const service = new DashboardAchievementService(store)

    await expect(
      service.evaluate('user', 'guild', 2, { wins: 25, settled: 50, largestNetWin: 900, highestWinningOdds: 6, longestWinning: 4 }),
    ).resolves.toEqual([])
    expect(store.save).toHaveBeenCalledTimes(3)
    expect(store.save).not.toHaveBeenCalledWith(expect.objectContaining({ key: expect.stringContaining('milestone') }))
  })

  it('creates one pending celebration for a new personal best', async () => {
    const existing = [
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'largest-net-win', bestValue: 500, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'highest-winning-odds', bestValue: 6, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'longest-winning-streak', bestValue: 4, pending: false },
    ]
    const store = { find: vi.fn().mockResolvedValue(existing), save: vi.fn(async value => value), update: vi.fn() }
    const service = new DashboardAchievementService(store)

    const celebrations = await service.evaluate('user', 'guild', 2, {
      wins: 26,
      settled: 51,
      largestNetWin: 700,
      highestWinningOdds: 6,
      longestWinning: 4,
    })

    expect(celebrations[0]?.title).toBe('Nouveau record personnel')
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ key: 'largest-net-win', bestValue: 700, pending: true }))
  })

  it('celebrates entering the podium without using activity milestones', async () => {
    const existing = [
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'largest-net-win', bestValue: 500, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'highest-winning-odds', bestValue: 6, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'longest-winning-streak', bestValue: 4, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'best-rank', bestValue: 5, pending: false },
    ]
    const store = { find: vi.fn().mockResolvedValue(existing), save: vi.fn(async value => value), update: vi.fn() }
    const service = new DashboardAchievementService(store)

    const celebrations = await service.evaluate('user', 'guild', 2, {
      wins: 8,
      settled: 12,
      largestNetWin: 500,
      highestWinningOdds: 6,
      longestWinning: 4,
      rank: 3,
    })

    expect(celebrations[0]?.title).toBe('Vous entrez sur le podium')
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ key: 'best-rank', bestValue: 3, pending: true }))
  })
})

describe('DashboardAchievementService queues', () => {
  it('persists and returns simultaneous records in deterministic order', async () => {
    const existing = [
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'largest-net-win', bestValue: 500, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'highest-winning-odds', bestValue: 4, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'longest-winning-streak', bestValue: 2, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'best-rank', bestValue: 5, pending: false },
    ]
    const store = { find: vi.fn().mockResolvedValue(existing), save: vi.fn(async value => value), update: vi.fn() }
    const service = new DashboardAchievementService(store)

    const celebrations = await service.evaluate('user', 'guild', 2, {
      wins: 10,
      settled: 20,
      largestNetWin: 800,
      highestWinningOdds: 7,
      longestWinning: 4,
      rank: 2,
    })

    expect(celebrations.map(celebration => celebration.key)).toEqual([
      'largest-net-win',
      'highest-winning-odds',
      'longest-winning-streak',
      'best-rank',
    ])
    expect(store.save).toHaveBeenCalledTimes(4)
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ key: 'best-rank', pending: true }))
  })

  it('returns existing pending records together with new improvements', async () => {
    const existing = [
      {
        userId: 'user',
        guildId: 'guild',
        seasonKey: '2',
        key: 'largest-net-win',
        bestValue: 700,
        pending: true,
        pendingTitle: 'Gain record',
        pendingDetail: '700 pièces.',
      },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'highest-winning-odds', bestValue: 4, pending: false },
      { userId: 'user', guildId: 'guild', seasonKey: '2', key: 'longest-winning-streak', bestValue: 2, pending: false },
    ]
    const store = { find: vi.fn().mockResolvedValue(existing), save: vi.fn(async value => value), update: vi.fn() }
    const service = new DashboardAchievementService(store)

    const celebrations = await service.evaluate('user', 'guild', 2, {
      wins: 10,
      settled: 20,
      largestNetWin: 700,
      highestWinningOdds: 6,
      longestWinning: 2,
    })

    expect(celebrations.map(celebration => celebration.key)).toEqual(['largest-net-win', 'highest-winning-odds'])
    expect(store.save).toHaveBeenCalledOnce()
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ key: 'highest-winning-odds', pending: true }))
  })
})
