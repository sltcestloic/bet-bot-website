import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'

import { AUTH_CLOCK } from '@/server/auth/auth.constants'
import { AuthController } from '@/server/auth/controllers/auth.controller'
import { AuthSessionEntity } from '@/server/auth/entities/auth-session.entity'
import { OAuthLoginAttemptEntity } from '@/server/auth/entities/oauth-login-attempt.entity'
import { SessionAuthGuard } from '@/server/auth/guards/session-auth.guard'
import { AuthService } from '@/server/auth/services/auth.service'
import { AuthCookieService } from '@/server/auth/services/auth-cookie.service'
import { AuthOriginService } from '@/server/auth/services/auth-origin.service'
import { AuthSessionService } from '@/server/auth/services/auth-session.service'
import { AuthTokenService } from '@/server/auth/services/auth-token.service'
import { DiscordOAuthService } from '@/server/auth/services/discord-oauth.service'
import { OAuthLoginAttemptService } from '@/server/auth/services/oauth-login-attempt.service'
import { ReturnToService } from '@/server/auth/services/return-to.service'
import { UsersModule } from '@/server/users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([AuthSessionEntity, OAuthLoginAttemptEntity]), UsersModule],
  controllers: [AuthController],
  providers: [
    ReturnToService,
    AuthCookieService,
    AuthOriginService,
    SessionAuthGuard,
    AuthService,
    {
      provide: AUTH_CLOCK,
      useValue: () => new Date(),
    },
    {
      provide: AuthTokenService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => new AuthTokenService(config.getOrThrow<string>('SESSION_COOKIE_SECRET')),
    },
    {
      provide: DiscordOAuthService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new DiscordOAuthService({
          clientId: config.getOrThrow<string>('DISCORD_CLIENT_ID'),
          clientSecret: config.getOrThrow<string>('DISCORD_CLIENT_SECRET'),
          callbackUrl: `${config.getOrThrow<string>('APP_ORIGIN')}/api/auth/discord/callback`,
        }),
    },
    {
      provide: AuthSessionService,
      inject: [getRepositoryToken(AuthSessionEntity), AuthTokenService, AUTH_CLOCK],
      useFactory: (sessions: Repository<AuthSessionEntity>, tokens: AuthTokenService, clock: () => Date) =>
        new AuthSessionService(sessions, tokens, clock),
    },
    {
      provide: OAuthLoginAttemptService,
      inject: [getRepositoryToken(OAuthLoginAttemptEntity), AuthTokenService, AUTH_CLOCK],
      useFactory: (attempts: Repository<OAuthLoginAttemptEntity>, tokens: AuthTokenService, clock: () => Date) =>
        new OAuthLoginAttemptService(attempts, tokens, clock),
    },
  ],
  exports: [SessionAuthGuard, AuthSessionService, AuthCookieService],
})
export class AuthModule {}
