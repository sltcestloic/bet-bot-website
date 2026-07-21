import { describe, expect, it, vi } from 'vitest'
import { DiscordOAuthService } from '@/server/auth/services/discord-oauth.service'

describe('DiscordOAuthService', () => {
  const config = {
    clientId: 'client-id',
    clientSecret: 'client-secret',
    callbackUrl: 'http://localhost:5173/api/auth/discord/callback',
  }

  it('builds an authorization-code URL with only the identify scope', () => {
    const service = new DiscordOAuthService(config, vi.fn())

    const url = new URL(service.getAuthorizationUrl('csrf-state'))

    expect(`${url.origin}${url.pathname}`).toBe('https://discord.com/oauth2/authorize')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('client_id')).toBe('client-id')
    expect(url.searchParams.get('redirect_uri')).toBe(config.callbackUrl)
    expect(url.searchParams.get('scope')).toBe('identify')
    expect(url.searchParams.get('state')).toBe('csrf-state')
  })

  it('exchanges the code and returns the current Discord profile', async () => {
    const fetchImplementation = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'temporary-token' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: '123',
        username: 'betfan',
        global_name: 'Bet Fan',
        avatar: 'avatar-hash',
        discriminator: '0',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    const service = new DiscordOAuthService(config, fetchImplementation)

    await expect(service.getUserFromCode('oauth-code')).resolves.toEqual({
      id: '123',
      username: 'betfan',
      globalName: 'Bet Fan',
      avatarHash: 'avatar-hash',
      discriminator: '0',
    })

    const tokenRequest = fetchImplementation.mock.calls[0]
    expect(tokenRequest[0]).toBe('https://discord.com/api/v10/oauth2/token')
    expect(tokenRequest[1].body).toBeInstanceOf(URLSearchParams)
    expect((tokenRequest[1].body as URLSearchParams).get('grant_type')).toBe('authorization_code')
    expect(fetchImplementation.mock.calls[1][1].headers.Authorization).toBe('Bearer temporary-token')
  })
})
