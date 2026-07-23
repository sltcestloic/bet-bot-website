// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { GamePageHeader } from '@/client/features/game/components/game-ui'

afterEach(cleanup)

describe('GamePageHeader', () => {
  it('renders contextual and operational header content', () => {
    render(<GamePageHeader eyebrow="Historique" title="Mes tickets" stale />)

    expect(screen.getByRole('heading', { name: 'Mes tickets' })).toBeTruthy()
    expect(screen.getByText('Historique')).toBeTruthy()
    expect(screen.getByText('Les données affichées peuvent être anciennes.')).toBeTruthy()

    expect(screen.queryByRole('button')).toBeNull()
  })
})
