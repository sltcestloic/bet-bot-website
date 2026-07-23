import { describe, expect, it } from 'vitest'

import { shouldRevalidateGameRoot } from '@/client/features/game/routing/game-loaders'

describe('shouldRevalidateGameRoot', () => {
  it('does not reload authentication when only stats filters change', () => {
    expect(
      shouldRevalidateGameRoot({
        currentUrl: new URL('https://example.com/app/1/stats?tab=performance'),
        nextUrl: new URL('https://example.com/app/1/stats?tab=activity'),
        defaultShouldRevalidate: true,
      } as never),
    ).toBe(false)
  })

  it('preserves normal revalidation for a pathname change', () => {
    expect(
      shouldRevalidateGameRoot({
        currentUrl: new URL('https://example.com/app/1/stats'),
        nextUrl: new URL('https://example.com/app/1/profile'),
        defaultShouldRevalidate: true,
      } as never),
    ).toBe(true)
  })
})
