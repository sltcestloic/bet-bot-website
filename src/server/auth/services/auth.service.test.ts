import { describe, expect, it, vi } from 'vitest'

import { AuthService } from '@/server/auth/services/auth.service'

describe('AuthService', () => {
  it('starts OAuth with a normalized destination and browser binding', async () => {
    const returnToService = { normalize: vi.fn(() => '/dashboard') }
    const loginAttempts = {
      create: vi.fn().mockResolvedValue({ state: 'state-token', browserToken: 'browser-token' }),
    }
    const discordOAuth = { getAuthorizationUrl: vi.fn(() => 'https://discord.com/oauth2/authorize?...') }
    const service = new AuthService(returnToService, loginAttempts as never, discordOAuth as never, {} as never, {} as never)

    await expect(service.startDiscordLogin('//unsafe.test', 'http://192.168.1.19:5173/api/auth/discord/callback')).resolves.toEqual({
      authorizationUrl: 'https://discord.com/oauth2/authorize?...',
      browserToken: 'browser-token',
    })
    expect(returnToService.normalize).toHaveBeenCalledWith('//unsafe.test')
    expect(loginAttempts.create).toHaveBeenCalledWith('/dashboard')
    expect(discordOAuth.getAuthorizationUrl).toHaveBeenCalledWith('state-token', 'http://192.168.1.19:5173/api/auth/discord/callback')
  })

  it('consumes the callback, synchronizes the user, and creates a session', async () => {
    const profile = {
      id: '123',
      username: 'betfan',
      globalName: 'Bet Fan',
      avatarHash: 'avatar-hash',
      discriminator: '0',
    }
    const user = { id: 'user-id', discordId: '123' }
    const loginAttempts = { consume: vi.fn().mockResolvedValue('/dashboard') }
    const discordOAuth = { getUserFromCode: vi.fn().mockResolvedValue(profile) }
    const users = { synchronizeDiscordProfile: vi.fn().mockResolvedValue(user) }
    const sessions = { create: vi.fn().mockResolvedValue({ token: 'session-token', expiresAt: nowPlusSevenDays() }) }
    const service = new AuthService({} as never, loginAttempts as never, discordOAuth as never, users as never, sessions as never)

    await expect(
      service.completeDiscordLogin('code', 'state', 'browser', 'http://192.168.1.19:5173/api/auth/discord/callback'),
    ).resolves.toEqual({
      returnTo: '/dashboard',
      sessionToken: 'session-token',
      sessionExpiresAt: nowPlusSevenDays(),
      user,
    })
    expect(loginAttempts.consume).toHaveBeenCalledWith('state', 'browser')
    expect(discordOAuth.getUserFromCode).toHaveBeenCalledWith('code', 'http://192.168.1.19:5173/api/auth/discord/callback')
    expect(users.synchronizeDiscordProfile).toHaveBeenCalledWith(profile)
    expect(sessions.create).toHaveBeenCalledWith(user)
  })
})

function nowPlusSevenDays() {
  return new Date('2026-07-28T12:00:00.000Z')
}
