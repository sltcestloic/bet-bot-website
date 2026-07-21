import { describe, expect, it } from 'vitest'
import { AuthTokenService } from '@/server/auth/services/auth-token.service'

describe('AuthTokenService', () => {
  const secret = 'a-secure-test-secret-that-is-long-enough'

  it('issues an opaque token and stores only its deterministic hash', () => {
    const service = new AuthTokenService(secret, () => Buffer.alloc(32, 7))

    const issued = service.issue()

    expect(issued.token).not.toBe(issued.tokenHash)
    expect(issued.token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(issued.tokenHash).toHaveLength(64)
    expect(service.hash(issued.token)).toBe(issued.tokenHash)
  })
})
