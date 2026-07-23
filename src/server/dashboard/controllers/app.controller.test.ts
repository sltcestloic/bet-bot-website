import { describe, expect, it } from 'vitest'

import { getStatsTab, getTicketViewFilters } from '@/server/dashboard/controllers/app.controller'

describe('player app controller helpers', () => {
  it('maps ticket views without treating cancelled tickets as losses', () => {
    expect(getTicketViewFilters()).toEqual({ outcome: 'PENDING' })
    expect(getTicketViewFilters('active')).toEqual({ outcome: 'PENDING' })
    expect(getTicketViewFilters('settled')).toEqual({ outcomes: ['WON', 'LOST', 'CANCELLED'] })
    expect(getTicketViewFilters('all')).toEqual({})
  })

  it('accepts only supported lightweight statistics tabs', () => {
    expect(getStatsTab('affinities')).toBe('affinities')
    expect(getStatsTab('unknown')).toBe('performance')
  })
})
