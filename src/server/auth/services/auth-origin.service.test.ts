import { describe, expect, it } from 'vitest'

import { AuthOriginService } from '@/server/auth/services/auth-origin.service'

describe('AuthOriginService', () => {
  it('uses the current private-network origin in development', () => {
    const service = new AuthOriginService({
      getOrThrow: (key: string) => (key === 'APP_ORIGIN' ? 'http://localhost:5173' : 'development'),
    } as never)

    expect(service.getCallbackUrl('http', '192.168.1.19:5173')).toBe('http://192.168.1.19:5173/api/auth/discord/callback')
  })

  it('keeps the configured origin in production', () => {
    const service = new AuthOriginService({
      getOrThrow: (key: string) => (key === 'APP_ORIGIN' ? 'https://bet-bot.example' : 'production'),
    } as never)

    expect(service.getCallbackUrl('http', '192.168.1.19:5173')).toBe('https://bet-bot.example/api/auth/discord/callback')
  })

  it('rejects arbitrary public hosts in development', () => {
    const service = new AuthOriginService({
      getOrThrow: (key: string) => (key === 'APP_ORIGIN' ? 'http://localhost:5173' : 'development'),
    } as never)

    expect(service.getCallbackUrl('https', 'attacker.example')).toBe('http://localhost:5173/api/auth/discord/callback')
  })
})
