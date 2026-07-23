import type { Repository } from 'typeorm'
import { describe, expect, it, vi } from 'vitest'

import { type AuthSessionEntity } from '@/server/auth/entities/auth-session.entity'
import { AuthSessionService } from '@/server/auth/services/auth-session.service'
import type { AuthTokenService } from '@/server/auth/services/auth-token.service'
import type { UserEntity } from '@/server/users/entities/user.entity'

const user = { id: 'user-id' } as UserEntity
const now = new Date('2026-07-21T12:00:00.000Z')

describe('AuthSessionService', () => {
  const createRepository = () => ({
    create: vi.fn(value => value),
    save: vi.fn(async value => value),
    findOne: vi.fn(),
    delete: vi.fn(),
  })
  const tokenService = {
    issue: vi.fn(() => ({ token: 'raw-session-token', tokenHash: 'session-hash' })),
    hash: vi.fn(() => 'session-hash'),
  } as unknown as AuthTokenService

  it('persists only the token hash with a seven-day expiry', async () => {
    const repository = createRepository()
    const service = new AuthSessionService(repository as unknown as Repository<AuthSessionEntity>, tokenService, () => now)

    const session = await service.create(user)

    expect(session.token).toBe('raw-session-token')
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: 'session-hash',
        user,
        expiresAt: new Date('2026-07-28T12:00:00.000Z'),
      }),
    )
    expect(repository.create).not.toHaveBeenCalledWith(expect.objectContaining({ token: 'raw-session-token' }))
  })

  it('renews an active session at most once per day', async () => {
    const repository = createRepository()
    repository.findOne.mockResolvedValue({
      tokenHash: 'session-hash',
      user,
      expiresAt: new Date('2026-07-25T12:00:00.000Z'),
      lastActivityAt: new Date('2026-07-19T12:00:00.000Z'),
    })
    const service = new AuthSessionService(repository as unknown as Repository<AuthSessionEntity>, tokenService, () => now)

    const authenticated = await service.authenticate('raw-session-token')

    expect(authenticated).toEqual(expect.objectContaining({ user, refreshCookie: true }))
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresAt: new Date('2026-07-28T12:00:00.000Z'),
        lastActivityAt: now,
      }),
    )
  })

  it('revokes the current opaque session by its hash', async () => {
    const repository = createRepository()
    const service = new AuthSessionService(repository as unknown as Repository<AuthSessionEntity>, tokenService, () => now)

    await service.revoke('raw-session-token')

    expect(repository.delete).toHaveBeenCalledWith({ tokenHash: 'session-hash' })
  })
})
