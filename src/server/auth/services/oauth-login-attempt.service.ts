import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, MoreThan, Repository } from 'typeorm'

import { AUTH_CLOCK, OAUTH_ATTEMPT_DURATION_MS } from '@/server/auth/auth.constants'
import { OAuthLoginAttemptEntity } from '@/server/auth/entities/oauth-login-attempt.entity'
import { AuthTokenService } from '@/server/auth/services/auth-token.service'
import type { Clock } from '@/server/auth/types/clock'

@Injectable()
export class OAuthLoginAttemptService {
  private lastCleanupAt = 0

  constructor(
    @InjectRepository(OAuthLoginAttemptEntity)
    private readonly attempts: Repository<OAuthLoginAttemptEntity>,
    private readonly tokens: AuthTokenService,
    @Inject(AUTH_CLOCK)
    private readonly now: Clock,
  ) {}

  async create(returnTo: string) {
    const now = this.now()
    const state = this.tokens.issue()
    const browser = this.tokens.issue()

    await this.cleanupExpired(now)
    await this.attempts.save(
      this.attempts.create({
        stateHash: state.tokenHash,
        browserTokenHash: browser.tokenHash,
        returnTo,
        expiresAt: new Date(now.getTime() + OAUTH_ATTEMPT_DURATION_MS),
      }),
    )

    return { state: state.token, browserToken: browser.token }
  }

  async consume(state: string, browserToken: string): Promise<string> {
    const stateHash = this.tokens.hash(state)
    const browserTokenHash = this.tokens.hash(browserToken)
    const attempt = await this.attempts.findOne({
      where: {
        stateHash,
        browserTokenHash,
        expiresAt: MoreThan(this.now()),
      },
    })

    if (!attempt) throw new UnauthorizedException('Invalid or expired OAuth state')

    const consumed = await this.attempts.delete({ stateHash, browserTokenHash })
    if (consumed.affected !== 1) throw new UnauthorizedException('OAuth state was already consumed')

    return attempt.returnTo
  }

  private async cleanupExpired(now: Date): Promise<void> {
    if (now.getTime() - this.lastCleanupAt < 60 * 60 * 1000) return
    this.lastCleanupAt = now.getTime()
    await this.attempts.delete({ expiresAt: LessThan(now) })
  }
}
