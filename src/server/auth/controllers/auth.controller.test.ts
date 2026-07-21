import type { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { ThrottlerGuard } from '@nestjs/throttler'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UsersService } from '@/server/users/services/users.service'
import { AuthController } from '@/server/auth/controllers/auth.controller'
import { SessionAuthGuard } from '@/server/auth/guards/session-auth.guard'
import { AuthCookieService } from '@/server/auth/services/auth-cookie.service'
import { AuthSessionService } from '@/server/auth/services/auth-session.service'
import { AuthService } from '@/server/auth/services/auth.service'

describe('AuthController HTTP flow', () => {
  let app: INestApplication
  const auth = {
    startDiscordLogin: vi.fn(),
    completeDiscordLogin: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: AuthSessionService, useValue: { revoke: vi.fn() } },
        { provide: UsersService, useValue: { toPublicUser: vi.fn((user) => user) } },
        { provide: ConfigService, useValue: { getOrThrow: () => 'http://localhost:5173' } },
        AuthCookieService,
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = module.createNestApplication()
    app.use(cookieParser())
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('binds the browser and redirects to Discord', async () => {
    auth.startDiscordLogin.mockResolvedValue({
      authorizationUrl: 'https://discord.com/oauth2/authorize?client_id=123',
      browserToken: 'browser-token',
    })

    const response = await request(app.getHttpServer())
      .get('/auth/discord')
      .query({ returnTo: '/auth/success' })
      .expect(302)
    const cookies = asCookieHeader(response.headers['set-cookie'])

    expect(response.headers.location).toBe('https://discord.com/oauth2/authorize?client_id=123')
    expect(cookies).toContain('bet_bot_oauth=browser-token')
    expect(cookies).toContain('HttpOnly')
    expect(cookies).toContain('SameSite=Lax')
    expect(auth.startDiscordLogin).toHaveBeenCalledWith('/auth/success')
  })

  it('sets the opaque session cookie and returns to the requested page', async () => {
    auth.completeDiscordLogin.mockResolvedValue({
      returnTo: '/auth/success',
      sessionToken: 'session-token',
      sessionExpiresAt: new Date('2026-07-28T12:00:00.000Z'),
      user: { id: '123' },
    })

    const response = await request(app.getHttpServer())
      .get('/auth/discord/callback')
      .set('Cookie', 'bet_bot_oauth=browser-token')
      .query({ code: 'oauth-code', state: 'oauth-state' })
      .expect(302)

    expect(response.headers.location).toBe('/auth/success')
    expect(asCookieHeader(response.headers['set-cookie'])).toContain('bet_bot_session=session-token')
    expect(auth.completeDiscordLogin).toHaveBeenCalledWith('oauth-code', 'oauth-state', 'browser-token')
  })

  it('returns to the login page when Discord rejects authorization', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/discord/callback')
      .query({ error: 'access_denied' })
      .expect(302)

    expect(response.headers.location).toBe('/login?error=oauth_failed')
  })
})

function asCookieHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(';') : value ?? ''
}
