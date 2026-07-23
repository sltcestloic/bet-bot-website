// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type * as GameApiModule from '@/client/features/game/api/game-api'
import { gameRequest } from '@/client/features/game/api/game-api'
import { StatsPage } from '@/client/features/game/pages/stats-page'

vi.mock('@/client/features/game/api/game-api', async importOriginal => {
  const original = await importOriginal<typeof GameApiModule>()
  return { ...original, gameRequest: vi.fn() }
})

afterEach(cleanup)

describe('StatsPage tab navigation', () => {
  it('does not render economy data as affinities while the next tab loads', async () => {
    vi.mocked(gameRequest)
      .mockReset()
      .mockResolvedValueOnce({
        season: null,
        seasons: [],
        account: { balance: 1_000, activeStake: 100 },
        entries: [],
      })
      .mockResolvedValueOnce({
        data: {
          season: null,
          seasons: [],
          sports: [],
          competitions: [],
          teams: [],
          breakdowns: { phases: [] },
        },
      })

    render(
      <MemoryRouter initialEntries={['/app/42/stats?tab=economy']}>
        <Routes>
          <Route path="/app/:guildId/stats" element={<StatsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByText('Journal des mouvements')
    fireEvent.click(screen.getByRole('button', { name: 'Affinités' }))

    await waitFor(() => {
      expect(screen.getByText('Votre préférence de jeu')).toBeTruthy()
    })
    expect(screen.getAllByText('Pas assez de données')).toHaveLength(3)
  })
})
