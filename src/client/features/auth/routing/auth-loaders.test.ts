import type { LoaderFunctionArgs } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthenticationRequiredError, AuthServiceUnavailableError } from '@/client/features/auth/api/auth-api'
import { createLoginLoader, createProtectedRouteLoader } from '@/client/features/auth/routing/auth-loaders'

const user = {
  id: '123',
  username: 'betfan',
  displayName: 'Bet Fan',
  avatarUrl: 'https://cdn.discordapp.com/avatar.png',
}

const loaderArgs = (url: string): LoaderFunctionArgs => ({
  request: new Request(url),
  url: new URL(url),
  pattern: new URL(url).pathname,
  params: {},
  context: undefined,
})

describe('auth route loaders', () => {
  it('redirects unauthenticated users to login with the requested path', async () => {
    const loader = createProtectedRouteLoader(vi.fn().mockRejectedValue(new AuthenticationRequiredError()))

    const response = await loader(loaderArgs('https://betbot.test/dashboard/settings?tab=profile'))

    expect(response).toBeInstanceOf(Response)
    expect((response as Response).status).toBe(302)
    expect((response as Response).headers.get('Location')).toBe(
      '/login?returnTo=%2Fdashboard%2Fsettings%3Ftab%3Dprofile',
    )
  })

  it('returns the user for an authenticated protected route', async () => {
    const loader = createProtectedRouteLoader(vi.fn().mockResolvedValue(user))

    await expect(loader(loaderArgs('https://betbot.test/auth/success'))).resolves.toEqual(user)
  })

  it('surfaces backend failures as a service-unavailable response', async () => {
    const loader = createProtectedRouteLoader(vi.fn().mockRejectedValue(new AuthServiceUnavailableError()))

    await expect(loader(loaderArgs('https://betbot.test/auth/success'))).rejects.toMatchObject({ status: 503 })
  })

  it('redirects an authenticated user away from login', async () => {
    const loader = createLoginLoader(vi.fn().mockResolvedValue(user))

    const response = await loader(loaderArgs('https://betbot.test/login?returnTo=%2Fauth%2Fsuccess'))

    expect(response).toBeInstanceOf(Response)
    expect((response as Response).headers.get('Location')).toBe('/auth/success')
  })
})
