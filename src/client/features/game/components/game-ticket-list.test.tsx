// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { GameTicketList } from '@/client/features/game/components/game-ticket-list'
import type { GameTicket } from '@/client/features/game/types/game-types'

const parlay: GameTicket = {
  id: 12,
  kind: 'PARLAY',
  outcome: 'LOST',
  stake: 200,
  odds: 3.4,
  payout: 0,
  placedAt: '2026-07-20T18:00:00Z',
  settledAt: '2026-07-20T21:00:00Z',
  hasCorrection: true,
  legs: [
    {
      id: 1,
      position: 1,
      optionName: 'France',
      odds: 1.8,
      placementPhase: 'PREMATCH',
      outcome: 'WON',
      sport: 'FOOTBALL',
      competition: 'Coupe',
      team1: 'France',
      team2: 'Espagne',
      startsAt: '2026-07-20T19:00:00Z',
      scoreTeam1: 2,
      scoreTeam2: 1,
      hasCorrection: true,
    },
    {
      id: 2,
      position: 2,
      optionName: 'Match nul',
      odds: 2.1,
      placementPhase: 'LIVE',
      outcome: 'LOST',
      sport: 'FOOTBALL',
      competition: 'Ligue',
      team1: 'Paris',
      team2: 'Lyon',
      startsAt: '2026-07-20T20:00:00Z',
      scoreTeam1: null,
      scoreTeam2: null,
      hasCorrection: false,
    },
  ],
}

afterEach(cleanup)

describe('GameTicketList parlay results', () => {
  it('summarizes a parlay with its selected options instead of the first match', () => {
    const threeLegParlay: GameTicket = {
      ...parlay,
      legs: [...parlay.legs, { ...parlay.legs[1], id: 3, position: 3, optionName: 'Marseille' }],
    }

    render(<GameTicketList tickets={[threeLegParlay]} />)

    expect(screen.getByText('France · Match nul · +1')).toBeTruthy()
    expect(screen.queryByText('France · Espagne')).toBeNull()
  })

  it('shows each leg result only after opening the parlay details', () => {
    render(<GameTicketList tickets={[parlay]} />)

    expect(screen.queryByText('Gagné')).toBeNull()
    expect(screen.queryByText('Score indisponible')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Combiné · 2 sélections/i }))

    expect(screen.getByText('Gagné')).toBeTruthy()
    expect(screen.getAllByText('Perdu')).toHaveLength(2)
    expect(screen.getByLabelText('France 2 – 1 Espagne')).toBeTruthy()
    expect(screen.getByText('Score indisponible')).toBeTruthy()
    const correctedLeg = screen.getByText('Résultat corrigé').closest('article')
    expect(correctedLeg).toBeTruthy()
    expect(within(correctedLeg!).getAllByText('France')).toHaveLength(2)
  })

  it('promotes total odds while keeping payout in the expanded details', () => {
    const winningParlay: GameTicket = {
      ...parlay,
      outcome: 'WON',
      payout: 680,
      legs: parlay.legs.map(leg => ({ ...leg, outcome: 'WON' })),
    }
    render(<GameTicketList tickets={[winningParlay]} />)

    expect(screen.getByText('Cote 3,40')).toBeTruthy()
    expect(screen.getByText('200 🪙')).toBeTruthy()
    expect(screen.queryByText('680 🪙')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Combiné · 2 sélections/i }))

    expect(screen.getByText('Gain total')).toBeTruthy()
    expect(screen.getByText('680 🪙')).toBeTruthy()
    expect(screen.getByLabelText('Cote de la sélection 1,80')).toBeTruthy()
  })

  it('shows the match score in expanded single ticket results', () => {
    const single: GameTicket = {
      ...parlay,
      id: 13,
      kind: 'SINGLE',
      odds: 1.8,
      legs: [parlay.legs[0]],
    }
    render(<GameTicketList tickets={[single]} />)

    expect(screen.queryByLabelText('France 2 – 1 Espagne')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /France/i }))

    expect(screen.getByLabelText('France 2 – 1 Espagne')).toBeTruthy()
    expect(screen.getByLabelText('Cote de la sélection 1,80')).toBeTruthy()
    expect(screen.getByText('Résultat corrigé')).toBeTruthy()
  })
})
