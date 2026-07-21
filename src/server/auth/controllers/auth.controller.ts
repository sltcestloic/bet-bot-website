import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import type { UserEntity } from '@/server/users/entities/user.entity'
import { UsersService } from '@/server/users/services/users.service'
import { OAUTH_BROWSER_COOKIE_NAME } from '@/server/auth/auth.constants'
import { CurrentUser } from '@/server/auth/decorators/current-user.decorator'
import { DiscordCallbackDto } from '@/server/auth/dto/discord-callback.dto'
import { StartDiscordLoginDto } from '@/server/auth/dto/start-discord-login.dto'
import { SessionAuthGuard } from '@/server/auth/guards/session-auth.guard'
import type { AuthenticatedRequest } from '@/server/auth/types/authenticated-request'
import { AuthCookieService } from '@/server/auth/services/auth-cookie.service'
import { AuthSessionService } from '@/server/auth/services/auth-session.service'
import { AuthService } from '@/server/auth/services/auth.service'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly auth: AuthService,
    private readonly sessions: AuthSessionService,
    private readonly cookies: AuthCookieService,
    private readonly users: UsersService,
  ) {}

  @Get('discord')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async startDiscordLogin(
    @Query() query: StartDiscordLoginDto,
    @Res() response: Response,
  ) {
    const login = await this.auth.startDiscordLogin(query.returnTo)
    this.cookies.setOAuthBrowserCookie(response, login.browserToken)
    return response.redirect(login.authorizationUrl)
  }

  @Get('discord/callback')
  async completeDiscordLogin(
    @Query() query: DiscordCallbackDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const browserToken = request.cookies?.[OAUTH_BROWSER_COOKIE_NAME]
    this.cookies.clearOAuthBrowserCookie(response)

    if (query.error || !query.code || !query.state || !browserToken) {
      return response.redirect('/login?error=oauth_failed')
    }

    try {
      const login = await this.auth.completeDiscordLogin(query.code, query.state, browserToken)
      this.cookies.setSessionCookie(response, login.sessionToken, login.sessionExpiresAt)
      this.logger.log(`Discord login succeeded for user ${login.user.id}`)
      return response.redirect(login.returnTo)
    } catch (error) {
      const category = error instanceof Error ? error.constructor.name : 'UnknownError'
      this.logger.warn(`Discord login failed (${category})`)
      return response.redirect('/login?error=oauth_failed')
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
