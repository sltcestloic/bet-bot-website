import { Injectable } from '@nestjs/common'
import { UsersService } from '@/server/users/services/users.service'
import { AuthSessionService } from '@/server/auth/services/auth-session.service'
import { DiscordOAuthService } from '@/server/auth/services/discord-oauth.service'
import { OAuthLoginAttemptService } from '@/server/auth/services/oauth-login-attempt.service'
import { ReturnToService } from '@/server/auth/services/return-to.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly returnTo: ReturnToService,
    private readonly loginAttempts: OAuthLoginAttemptService,
    private readonly discordOAuth: DiscordOAuthService,
    private readonly users: UsersService,
    private readonly sessions: AuthSessionService,
  ) {}

  async startDiscordLogin(destination?: string) {
    const returnTo = this.returnTo.normalize(destination)
    const attempt = await this.loginAttempts.create(returnTo)

    return {
      authorizationUrl: this.discordOAuth.getAuthorizationUrl(attempt.state),
      browserToken: attempt.browserToken,
    }
  }

  async completeDiscordLogin(code: string, state: string, browserToken: string) {
    const returnTo = await this.loginAttempts.consume(state, browserToken)
    const profile = await this.discordOAuth.getUserFromCode(code)
    const user = await this.users.synchronizeDiscordProfile(profile)
    const session = await this.sessions.create(user)

    return {
      returnTo,
      sessionToken: session.token,
      sessionExpiresAt: session.expiresAt,
      user,
    }
  }
}
