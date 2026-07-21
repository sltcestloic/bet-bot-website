import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { CookieOptions, Response } from 'express'
import { OAUTH_ATTEMPT_DURATION_MS, OAUTH_BROWSER_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/server/auth/auth.constants'

@Injectable()
export class AuthCookieService {
  private readonly secure: boolean

  constructor(config: ConfigService) {
    this.secure = config.getOrThrow<string>('APP_ORIGIN').startsWith('https://')
  }

  setOAuthBrowserCookie(response: Response, token: string): void {
    response.cookie(OAUTH_BROWSER_COOKIE_NAME, token, {
      ...this.baseOptions(),
      maxAge: OAUTH_ATTEMPT_DURATION_MS,
    })
  }

  clearOAuthBrowserCookie(response: Response): void {
    response.clearCookie(OAUTH_BROWSER_COOKIE_NAME, this.baseOptions())
  }

  setSessionCookie(response: Response, token: string, expiresAt: Date): void {
    response.cookie(SESSION_COOKIE_NAME, token, {
      ...this.baseOptions(),
      expires: expiresAt,
    })
  }

  clearSessionCookie(response: Response): void {
    response.clearCookie(SESSION_COOKIE_NAME, this.baseOptions())
  }

  private baseOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.secure,
      path: '/',
    }
  }
}
