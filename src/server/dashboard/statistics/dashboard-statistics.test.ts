import { describe, expect, it } from 'vitest'

import { calculateStakeQuartiles, calculateStreaks, calculateTicketMetrics } from '@/server/dashboard/statistics/dashboard-statistics'

const settledTicket = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  seasonId: 1,
  outcome: 'WON' as const,
  stake: 100,
  odds: 2,
  payout: 200,
  settledAt: new Date('2026-07-01T12:00:00Z'),
  ...overrides,
})

describe('dashboard statistics', () => {
  it('calculates performance from won and lost tickets only', () => {
    const metrics = calculateTicketMetrics([
      settledTicket(),
      settledTicket({ id: 2, outcome: 'LOST', stake: 50, payout: 0 }),
      settledTicket({ id: 3, outcome: 'PENDING', stake: 500, payout: 0, settledAt: null }),
      settledTicket({ id: 4, outcome: 'CANCELLED', stake: 800, payout: 800 }),
    ])

    expect(metrics).toMatchObject({
      placed: 4,
      pending: 1,
      cancelled: 1,
      settled: 2,
      wins: 1,
      losses: 1,
      totalStaked: 150,
      grossPayout: 200,
      realizedProfit: 50,
      winRate: 0.5,
      roi: 1 / 3,
    })
  })

  it('returns unavailable rates when there are no settled observations', () => {
    const metrics = calculateTicketMetrics([settledTicket({ outcome: 'PENDING', settledAt: null })])

    expect(metrics.winRate).toBeNull()
    expect(metrics.roi).toBeNull()
    expect(metrics.averageOdds).toBeNull()
  })

  it('resets streaks at season boundaries', () => {
    const streaks = calculateStreaks([
      settledTicket({ id: 1, seasonId: 1, settledAt: new Date('2026-06-01'), outcome: 'WON' }),
      settledTicket({ id: 2, seasonId: 1, settledAt: new Date('2026-06-02'), outcome: 'WON' }),
      settledTicket({ id: 3, seasonId: 2, settledAt: new Date('2026-07-01'), outcome: 'WON' }),
      settledTicket({ id: 4, seasonId: 2, settledAt: new Date('2026-07-02'), outcome: 'LOST' }),
    ])

    expect(streaks.longestWinning).toBe(2)
    expect(streaks.current).toEqual({ outcome: 'LOST', length: 1 })
  })

  it('uses contextual quartiles only with enough settled tickets', () => {
    expect(calculateStakeQuartiles(Array.from({ length: 19 }, (_, index) => index + 1))).toBeNull()
    expect(calculateStakeQuartiles(Array.from({ length: 20 }, (_, index) => (index + 1) * 10))).toEqual({
      low: 50,
      median: 100,
      high: 150,
    })
  })
})
