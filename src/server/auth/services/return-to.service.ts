import { Injectable } from '@nestjs/common'

const FALLBACK_DESTINATION = '/auth/success'

@Injectable()
export class ReturnToService {
  normalize(destination?: string | null): string {
    if (!destination || !destination.startsWith('/') || destination.startsWith('//')) {
      return FALLBACK_DESTINATION
    }

    if (destination.includes('\\') || /^\/login(?:[?#]|$)/.test(destination) || destination.startsWith('/api/auth')) {
      return FALLBACK_DESTINATION
    }

    try {
      const parsed = new URL(destination, 'https://betbot.local')
      return parsed.origin === 'https://betbot.local'
        ? `${parsed.pathname}${parsed.search}${parsed.hash}`
        : FALLBACK_DESTINATION
    } catch {
      return FALLBACK_DESTINATION
    }
  }
}
