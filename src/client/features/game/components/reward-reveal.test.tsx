// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { gameRequest } from '@/client/features/game/api/game-api'
import { RewardReveal } from '@/client/features/game/components/reward-reveal'

vi.mock('@/client/features/game/api/game-api', () => ({ gameRequest: vi.fn() }))

const achievements = [
  { key: 'largest-net-win', title: 'Gain record', detail: '700 pièces.' },
  { key: 'highest-winning-odds', title: 'Cote record', detail: 'Une cote de 6,00.' },
]

afterEach(() => {
  cleanup()
  vi.mocked(gameRequest).mockReset()
})

describe('RewardReveal', () => {
  it('acknowledges records on dismissal and advances through the queue', async () => {
    vi.mocked(gameRequest).mockResolvedValue(undefined)
    render(<RewardReveal guildId="guild" achievements={achievements} />)
    const firstHeading = screen.getByRole('heading', { name: 'Gain record' })

    expect(gameRequest).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Record suivant' }))

    await screen.findByRole('heading', { name: 'Cote record' })
    expect(firstHeading.isConnected).toBe(false)
    expect(gameRequest).toHaveBeenNthCalledWith(1, '/guilds/guild/achievements/largest-net-win/acknowledge', { method: 'POST' })

    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(gameRequest).toHaveBeenNthCalledWith(2, '/guilds/guild/achievements/highest-winning-odds/acknowledge', { method: 'POST' })
  })

  it('keeps the current record open when acknowledgement fails and retries it', async () => {
    vi.mocked(gameRequest).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)
    render(<RewardReveal guildId="guild" achievements={[achievements[0]]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Gain record' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(gameRequest).toHaveBeenCalledTimes(2)
  })

  it('acknowledges and dismisses the current record with Escape', async () => {
    vi.mocked(gameRequest).mockResolvedValue(undefined)
    render(<RewardReveal guildId="guild" achievements={[achievements[0]]} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    expect(gameRequest).toHaveBeenCalledOnce()
  })
})

describe('RewardReveal viewport behavior', () => {
  it('portals the scrollable dialog, locks page scroll, traps focus, and restores focus', async () => {
    const previous = document.createElement('button')
    document.body.append(previous)
    previous.focus()

    const view = render(<RewardReveal guildId="guild" achievements={[achievements[0]]} />)
    const dialog = screen.getByRole('dialog')
    const close = screen.getByRole('button', { name: 'Fermer' })
    const action = screen.getByRole('button', { name: 'Continuer' })

    expect(dialog.parentElement).toBe(document.body)
    expect(dialog.className).toContain('overflow-y-auto')
    expect(document.body.style.overflow).toBe('hidden')
    await waitFor(() => {
      expect(document.activeElement).toBe(action)
    })

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(action)

    view.unmount()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(previous)
    previous.remove()
  })
})
