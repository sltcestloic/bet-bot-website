import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const CALLBACK_PATH = '/api/auth/discord/callback'

@Injectable()
export class AuthOriginService {
  private readonly configuredOrigin: string
  private readonly isProduction: boolean

  constructor(config: ConfigService) {
    this.configuredOrigin = config.getOrThrow<string>('APP_ORIGIN')
    this.isProduction = config.getOrThrow<string>('NODE_ENV') === 'production'
  }

  getCallbackUrl(protocol: string, host: string | undefined) {
    if (!this.isProduction && host) {
      const requestOrigin = getAllowedDevelopmentOrigin(protocol, host)
      if (requestOrigin) return `${requestOrigin}${CALLBACK_PATH}`
    }
    return `${this.configuredOrigin}${CALLBACK_PATH}`
  }
}

function getAllowedDevelopmentOrigin(protocol: string, host: string) {
  try {
    const origin = new URL(`${protocol}://${host}`)
    if (!['http:', 'https:'].includes(origin.protocol) || !isLocalHostname(origin.hostname)) return null
    return origin.origin
  } catch {
    return null
  }
}

function isLocalHostname(hostname: string) {
  if (hostname === 'localhost' || hostname === '::1' || hostname.startsWith('127.')) return true
  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false
  if (octets[0] === 10 || (octets[0] === 192 && octets[1] === 168)) return true
  return octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31
}
