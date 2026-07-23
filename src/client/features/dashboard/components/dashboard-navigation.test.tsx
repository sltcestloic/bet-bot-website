// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DashboardBrand, getGuildDestination } from '@/client/features/dashboard/components/dashboard-navigation'

describe('authenticated dashboard navigation', () => {
  it('links the brand to the dashboard root', () => {
    render(
      <MemoryRouter>
        <DashboardBrand />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Bet Bot' }).getAttribute('href')).toBe('/dashboard')
  })

  it('keeps the current page and query when switching guilds', () => {
    expect(getGuildDestination('/dashboard/old/history', '?season=4&kind=PARLAY', 'old', 'new')).toBe(
      '/dashboard/new/history?season=4&kind=PARLAY',
    )
  })
})
