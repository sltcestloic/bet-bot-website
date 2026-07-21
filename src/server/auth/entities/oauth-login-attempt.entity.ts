import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'oauth_login_attempts' })
export class OAuthLoginAttemptEntity {
  @PrimaryColumn({ name: 'state_hash', type: 'char', length: 64 })
  stateHash!: string

  @Column({ name: 'browser_token_hash', type: 'char', length: 64 })
  browserTokenHash!: string

  @Column({ name: 'return_to', type: 'varchar', length: 2048 })
  returnTo!: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
