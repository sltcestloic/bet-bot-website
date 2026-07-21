import { describe, expect, it } from 'vitest'
import { ReturnToService } from '@/server/auth/services/return-to.service'

describe('ReturnToService', () => {
  const service = new ReturnToService()

  it('keeps internal application paths', () => {
    expect(service.normalize('/dashboard/settings?tab=profile')).toBe('/dashboard/settings?tab=profile')
  })

  it.each([
    'https://attacker.test',
    '//attacker.test/path',
    '/\\attacker.test',
    'dashboard',
    '/login',
    '/login?returnTo=/auth/success',
    '/api/auth/discord',
  ])('rejects unsafe or looping destinations: %s', (destination) => {
    expect(service.normalize(destination)).toBe('/auth/success')
  })
})
