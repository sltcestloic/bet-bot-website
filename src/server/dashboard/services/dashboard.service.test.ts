import { describe, expect, it, vi } from 'vitest'

import { DashboardService } from '@/server/dashboard/services/dashboard.service'

describe('DashboardService public profiles', () => {
  it('does not expose internal guild-user fields', async () => {
    const repository = {
      getPlayerIdentity: vi.fn().mockResolvedValue({ discordId: '2', username: 'player', globalName: null, avatarHash: null }),
    }
    const access = { assertSharedGuild: vi.fn().mockResolvedValue(undefined) }
    const service = new DashboardService(repository as never, access as never, {} as never, {} as never, {} as never)
    vi.spyOn(service, 'getOverview').mockResolvedValue({
      data: { account: { userId: 42, balance: 1200, activeStake: 50, participatedAt: '2026-01-01', isBanned: false } },
    } as never)
    vi.spyOn(service, 'getPerformance').mockResolvedValue({ data: {} } as never)

    const result = await service.getPublicProfile('1', '2', 'guild')

    expect(result.overview.account).toBeNull()
  })
})

describe('DashboardService player HUD', () => {
  it('authorizes the guild and returns only the active account snapshot', async () => {
    const season = { id: 3, status: 'ACTIVE' }
    const account = { balance: 1200, activeStake: 50 }
    const repository = { listSeasons: vi.fn().mockResolvedValue([season]), getAccount: vi.fn().mockResolvedValue(account) }
    const access = { assertGuildAccess: vi.fn().mockResolvedValue(undefined) }
    const service = new DashboardService(repository as never, access as never, {} as never, {} as never, {} as never)

    await expect(service.getPlayerHud('1', 'guild')).resolves.toEqual({ season, account })
    expect(access.assertGuildAccess).toHaveBeenCalledWith('1', 'guild')
    expect(repository.getAccount).toHaveBeenCalledWith('1', 'guild', 3)
  })
})

describe('DashboardService leaderboards', () => {
  it('provides a displayable Discord avatar for every ranked player', async () => {
    const season = { id: 3, status: 'ACTIVE' }
    const rows = [
      { discordId: '1010998423178203156', avatarHash: 'custom-avatar', rank: 1 },
      { discordId: '2', avatarHash: null, rank: 2 },
    ]
    const repository = {
      listSeasons: vi.fn().mockResolvedValue([season]),
      getLeaderboard: vi.fn().mockResolvedValue(rows),
      getStreakLeaderboard: vi.fn().mockResolvedValue(rows),
    }
    const access = { assertGuildAccess: vi.fn().mockResolvedValue(undefined) }
    const service = new DashboardService(repository as never, access as never, {} as never, {} as never, {} as never)

    const result = await service.getLeaderboards('viewer', 'guild')

    expect(result.boards.balance).toEqual([
      expect.objectContaining({ avatarUrl: 'https://cdn.discordapp.com/avatars/1010998423178203156/custom-avatar.png?size=128' }),
      expect.objectContaining({ avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' }),
    ])
  })
})
