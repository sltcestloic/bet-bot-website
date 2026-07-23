import { describe, expect, it, vi } from 'vitest'

import { DashboardRepository } from '@/server/dashboard/repositories/dashboard.repository'

describe('DashboardRepository performance filters', () => {
  it('applies outcome and leg filters to headline metrics', async () => {
    const query = vi.fn().mockResolvedValue([
      {
        placed: 0,
        pending: 0,
        cancelled: 0,
        settled: 0,
        wins: 0,
        losses: 0,
        totalStaked: 0,
        grossPayout: 0,
        realizedProfit: 0,
        winRate: null,
        roi: null,
        averageOdds: null,
        averageStake: null,
        highestWinningOdds: null,
        largestStake: null,
        largestPayout: null,
        largestNetWin: null,
      },
    ])
    const repository = new DashboardRepository({ query } as never)

    await repository.getMetrics('viewer', 'guild', 4, {
      outcome: 'WON',
      sport: 'Football',
      competition: 'Ligue 1',
      team: 'Paris',
      phase: 'LIVE',
    })

    expect(query).toHaveBeenCalledWith(expect.stringContaining('filtered_leg.sport::text'), [
      'viewer',
      'guild',
      4,
      null,
      null,
      null,
      'WON',
      'Football',
      'Ligue 1',
      'Paris',
      'LIVE',
    ])
  })

  it('ranks balances from the season account snapshot', async () => {
    const query = vi.fn().mockResolvedValue([])
    const repository = new DashboardRepository({ query } as never)

    await repository.getLeaderboard('guild', 4, 'balance', 'viewer')

    expect(query).toHaveBeenCalledWith(expect.stringContaining('balance AS value'), ['guild', 4, 'viewer'])
    expect(query.mock.calls[0][0]).not.toContain('balance + "activeStake"')
  })

  it('returns owner audit timelines and anomaly details', async () => {
    const query = vi.fn().mockResolvedValue([])
    const repository = new DashboardRepository({ query } as never)

    const result = await repository.getAdminSummary()

    expect(result).toHaveProperty('lifecycle')
    expect(result).toHaveProperty('anomalies')
    expect(result).toHaveProperty('ledgerFlows')
  })

  it('counts only the selected team in team breakdowns', async () => {
    const query = vi.fn().mockResolvedValue([])
    const repository = new DashboardRepository({ query } as never)

    await repository.getCategories('viewer', 'guild', 4, 'team')

    const sql = query.mock.calls[0][0] as string
    expect(sql).toContain('leg."optionName" = leg.team1')
    expect(sql).toContain('leg."optionName" = leg.team2')
    expect(sql).not.toContain('CROSS JOIN LATERAL')
  })

  it('identifies corrections on the exact ticket leg', async () => {
    const query = vi.fn().mockResolvedValue([])
    const repository = new DashboardRepository({ query } as never)

    await repository.getTickets('viewer', 'guild', 4, { filters: {} })
    await repository.getRecentTickets('viewer', 'guild', 4)

    for (const [sql] of query.mock.calls) {
      expect(sql).toContain(`'hasCorrection', EXISTS`)
      expect(sql).toContain('correction."matchId" = leg."matchId"')
    }
  })
})
