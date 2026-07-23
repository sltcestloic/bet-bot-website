import { Controller, Get, HttpCode, HttpStatus, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import type { Request, Response } from 'express'

import { OAUTH_BROWSER_COOKIE_NAME } from '@/server/auth/auth.constants'
import { CurrentUser } from '@/server/auth/decorators/current-user.decorator'
import { DiscordCallbackDto } from '@/server/auth/dto/discord-callback.dto'
import { StartDiscordLoginDto } from '@/server/auth/dto/start-discord-login.dto'
import { SessionAuthGuard } from '@/server/auth/guards/session-auth.guard'
import { AuthService } from '@/server/auth/services/auth.service'
import { AuthCookieService } from '@/server/auth/services/auth-cookie.service'
import { AuthOriginService } from '@/server/auth/services/auth-origin.service'
import { AuthSessionService } from '@/server/auth/services/auth-session.service'
import type { AuthenticatedRequest } from '@/server/auth/types/authenticated-request'
import { getRequestCookie } from '@/server/auth/utils/request-cookie'
import type { UserEntity } from '@/server/users/entities/user.entity'
import { UsersService } from '@/server/users/services/users.service'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly auth: AuthService,
    private readonly sessions: AuthSessionService,
    private readonly cookies: AuthCookieService,
    private readonly origin: AuthOriginService,
    private readonly users: UsersService,
  ) {}

  @Get('discord')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async startDiscordLogin(@Query() query: StartDiscordLoginDto, @Req() request: Request, @Res() response: Response) {
    const callbackUrl = this.origin.getCallbackUrl(request.protocol, request.get('host'))
    const login = await this.auth.startDiscordLogin(query.returnTo, callbackUrl)
    this.cookies.setOAuthBrowserCookie(response, login.browserToken)
    response.redirect(login.authorizationUrl)
  }

  @Get('discord/callback')
  async completeDiscordLogin(@Query() query: DiscordCallbackDto, @Req() request: Request, @Res() response: Response) {
    const browserToken = getRequestCookie(request, OAUTH_BROWSER_COOKIE_NAME)
    this.cookies.clearOAuthBrowserCookie(response)

    if (query.error || !query.code || !query.state || !browserToken) {
      response.redirect('/login?error=oauth_failed')
      return
    }

    try {
      const callbackUrl = this.origin.getCallbackUrl(request.protocol, request.get('host'))
      const login = await this.auth.completeDiscordLogin(query.code, query.state, browserToken, callbackUrl)
      this.cookies.setSessionCookie(response, login.sessionToken, login.sessionExpiresAt)
      this.logger.log(`Discord login succeeded for user ${login.user.id}`)
      response.redirect(login.returnTo)
      return
    } catch (error) {
      const category = error instanceof Error ? error.constructor.name : 'UnknownError'
      this.logger.warn(`Discord login failed (${category})`)
      response.redirect('/login?error=oauth_failed')
      return
    }
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  getCurrentUser(@CurrentUser() user: UserEntity) {
    return this.users.toPublicUser(user)
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: AuthenticatedRequest, @Res() response: Response) {
    await this.sessions.revoke(request.authSessionToken)
    this.cookies.clearSessionCookie(response)
    return response.status(HttpStatus.NO_CONTENT).send()
  }
}
