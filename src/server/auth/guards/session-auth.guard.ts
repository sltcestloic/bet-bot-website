import { CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Response } from 'express'
import { SESSION_COOKIE_NAME } from '@/server/auth/auth.constants'
import type { AuthenticatedRequest } from '@/server/auth/types/authenticated-request'
import { AuthCookieService } from '@/server/auth/services/auth-cookie.service'
import { AuthSessionService } from '@/server/auth/services/auth-session.service'

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly sessions: AuthSessionService,
    private readonly cookies: AuthCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const response = context.switchToHttp().getResponse<Response>()
    const sessionToken = request.cookies?.[SESSION_COOKIE_NAME]
    const authenticated = await this.sessions.authenticate(sessionToken)

    if (!authenticated) {
      this.cookies.clearSessionCookie(response)
      throw new UnauthorizedException()
    }

    request.authUser = authenticated.user
    request.authSessionToken = sessionToken

    if (authenticated.refreshCookie) {
      this.cookies.setSessionCookie(response, sessionToken, authenticated.expiresAt)
    }

    return true
  }
}
