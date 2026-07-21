import { describe, expect, it, vi } from 'vitest'
import type { Repository } from 'typeorm'
import { OAuthLoginAttemptEntity } from '@/server/auth/entities/oauth-login-attempt.entity'
import { OAuthLoginAttemptService } from '@/server/auth/services/oauth-login-attempt.service'
import type { AuthTokenService } from '@/server/auth/services/auth-token.service'

const now = new Date('2026-07-21T12:00:00.000Z')

describe('OAuthLoginAttemptService', () => {
  const repository = {
    create: vi.fn((value) => value),
    save: vi.fn(async (value) => value),
    findOne: vi.fn(),
    delete: vi.fn(),
  }
  const tokenService = {
    issue: vi.fn()
      .mockReturnValueOnce({ token: 'state-token', tokenHash: 'state-hash' })
      .mockReturnValueOnce({ token: 'browser-token', tokenHash: 'browser-hash' }),
    hash: vi.fn((token: string) => `${token}-hash`),
  } as unknown as AuthTokenService

  it('creates a short-lived login attempt without storing raw tokens', async () => {
    const service = new OAuthLoginAttemptService(
      repository as unknown as Repository<OAuthLoginAttemptEntity>,
      tokenService,
      () => now,
    )

    const attempt = await service.create('/dashboard')

    expect(attempt).toEqual({ state: 'state-token', browserToken: 'browser-token' })
    expect(repository.create).toHaveBeenCalledWith({
      stateHash: 'state-hash',
      browserTokenHash: 'browser-hash',
      returnTo: '/dashboard',
      expiresAt: new Date('2026-07-21T12:10:00.000Z'),
    })
  })

  it('consumes a matching attempt only once', async () => {
    repository.findOne.mockResolvedValue({
      stateHash: 'state-token-hash',
      browserTokenHash: 'browser-token-hash',
      returnTo: '/dashboard',
      expiresAt: new Date('2026-07-21T12:05:00.000Z'),
    })
    repository.delete.mockResolvedValue({ affected: 1 })
    const service = new OAuthLoginAttemptService(
      repository as unknown as Repository<OAuthLoginAttemptEntity>,
      tokenService,
      () => now,
    )

    await expect(service.consume('state-token', 'browser-token')).resolves.toBe('/dashboard')
    expect(repository.delete).toHaveBeenCalledWith({
      stateHash: 'state-token-hash',
      browserTokenHash: 'browser-token-hash',
    })
  })
})
