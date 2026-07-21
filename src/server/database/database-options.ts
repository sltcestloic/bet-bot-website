import type { DataSourceOptions } from 'typeorm'
import { AuthSessionEntity } from '@/server/auth/entities/auth-session.entity'
import { OAuthLoginAttemptEntity } from '@/server/auth/entities/oauth-login-attempt.entity'
import { UserEntity } from '@/server/users/entities/user.entity'
import { InitialAuthSchema1784584800000 } from '@/server/database/migrations/1784584800000-initial-auth-schema'

export function createDatabaseOptions(
  databaseUrl: string,
  useSsl: boolean,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    entities: [UserEntity, AuthSessionEntity, OAuthLoginAttemptEntity],
    migrations: [InitialAuthSchema1784584800000],
  }
}
