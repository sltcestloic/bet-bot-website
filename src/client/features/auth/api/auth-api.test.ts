import { describe, expect, it, vi } from 'vitest'
import { AuthenticationRequiredError, AuthServiceUnavailableError, getCurrentUser } from '@/client/features/auth/api/auth-api'

describe('getCurrentUser', () => {
  it('returns the authenticated Discord profile', async () => {
    const profile = {
      id: '123',
      username: 'betfan',
      displayName: 'Bet Fan',
      avatarUrl: 'https://cdn.discordapp.com/avatar.png',
    }
    const fetchImplementation = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(profile), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(getCurrentUser(fetchImplementation)).resolves.toEqual(profile)
    expect(fetchImplementation).toHaveBeenCalledWith('/api/auth/me', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
  })

  it('distinguishes a missing session from an unavailable auth service', async () => {
    const unauthorizedFetch = vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    const unavailableFetch = vi.fn().mockResolvedValue(new Response(null, { status: 503 }))

    await expect(getCurrentUser(unauthorizedFetch)).rejects.toBeInstanceOf(AuthenticationRequiredError)
    await expect(getCurrentUser(unavailableFetch)).rejects.toBeInstanceOf(AuthServiceUnavailableError)
  })
})
