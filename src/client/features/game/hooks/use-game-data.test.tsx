// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type * as GameApiModule from '@/client/features/game/api/game-api'
import { gameRequest } from '@/client/features/game/api/game-api'
import { useGameData } from '@/client/features/game/hooks/use-game-data'

vi.mock('@/client/features/game/api/game-api', async importOriginal => {
  const original = await importOriginal<typeof GameApiModule>()
  return { ...original, gameRequest: vi.fn() }
})

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>(promiseResolve => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

describe('useGameData', () => {
  it('clears incompatible data when the path changes', async () => {
    const performance = deferred<{ tab: string }>()
    const economy = deferred<{ tab: string }>()
    vi.mocked(gameRequest).mockReset().mockReturnValueOnce(performance.promise).mockReturnValueOnce(economy.promise)
    const { result, rerender } = renderHook(({ path }) => useGameData<{ tab: string }>(path), {
      initialProps: { path: '/stats?tab=performance' },
      wrapper,
    })

    await waitFor(() => {
      expect(gameRequest).toHaveBeenCalledTimes(1)
    })
    act(() => {
      performance.resolve({ tab: 'performance' })
    })
    await waitFor(() => {
      expect(result.current.data).toEqual({ tab: 'performance' })
    })

    rerender({ path: '/stats?tab=economy' })

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeUndefined()
    act(() => {
      economy.resolve({ tab: 'economy' })
    })
    await waitFor(() => {
      expect(result.current.data).toEqual({ tab: 'economy' })
    })
  })

  it('ignores an obsolete response after a rapid path change', async () => {
    const performance = deferred<{ tab: string }>()
    const economy = deferred<{ tab: string }>()
    vi.mocked(gameRequest).mockReset().mockReturnValueOnce(performance.promise).mockReturnValueOnce(economy.promise)
    const { result, rerender } = renderHook(({ path }) => useGameData<{ tab: string }>(path), {
      initialProps: { path: '/stats?tab=performance' },
      wrapper,
    })
    await waitFor(() => {
      expect(gameRequest).toHaveBeenCalledTimes(1)
    })

    rerender({ path: '/stats?tab=economy' })
    await waitFor(() => {
      expect(gameRequest).toHaveBeenCalledTimes(2)
    })
    act(() => {
      economy.resolve({ tab: 'economy' })
    })
    await waitFor(() => {
      expect(result.current.data).toEqual({ tab: 'economy' })
    })

    act(() => {
      performance.resolve({ tab: 'performance' })
    })
    await waitFor(() => {
      expect(result.current.data).toEqual({ tab: 'economy' })
    })
  })
})
