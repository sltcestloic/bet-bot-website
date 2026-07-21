import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, MoreThan, Repository } from 'typeorm'
import type { UserEntity } from '@/server/users/entities/user.entity'
import { AUTH_CLOCK, SESSION_DURATION_MS, SESSION_RENEWAL_INTERVAL_MS } from '@/server/auth/auth.constants'
import { AuthSessionEntity } from '@/server/auth/entities/auth-session.entity'
import type { Clock } from '@/server/auth/types/clock'
import { AuthTokenService } from '@/server/auth/services/auth-token.service'

@Injectable()
export class AuthSessionService {
  private lastCleanupAt = 0

  constructor(
    @InjectRepository(AuthSessionEntity)
    private readonly sessions: Repository<AuthSessionEntity>,
    private readonly tokens: AuthTokenService,
    @Inject(AUTH_CLOCK)
    private readonly now: Clock,
  ) {}

  async create(user: UserEntity) {
    const now = this.now()
    const { token, tokenHash } = this.tokens.issue()
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS)

    await this.cleanupExpired(now)
    await this.sessions.save(this.sessions.create({
      tokenHash,
      user,
      userId: user.id,
      expiresAt,
      lastActivityAt: now,
    }))

    return { token, expiresAt }
  }

  async authenticate(token: string) {
    if (!token) return null

    const now = this.now()
    const session = await this.sessions.findOne({
      where: { tokenHash: this.tokens.hash(token), expiresAt: MoreThan(now) },
      relations: { user: true },
    })

    if (!session) return null

    const shouldRenew = now.getTime() - session.lastActivityAt.getTime() >= SESSION_RENEWAL_INTERVAL_MS
    if (shouldRenew) {
      session.lastActivityAt = now
      session.expiresAt = new Date(now.getTime() + SESSION_DURATION_MS)
      await this.sessions.save(session)
    }

    return {
      user: session.user,
      refreshCookie: shouldRenew,
      expiresAt: session.expiresAt,
    }
  }

  async revoke(token: string): Promise<void> {
    if (!token) return
    await this.sessions.delete({ tokenHash: this.tokens.hash(token) })
  }

  private async cleanupExpired(now: Date): Promise<void> {
    if (now.getTime() - this.lastCleanupAt < 60 * 60 * 1000) return
    this.lastCleanupAt = now.getTime()
    await this.sessions.delete({ expiresAt: LessThan(now) })
  }
}
