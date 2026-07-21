import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { UserEntity } from '@/server/users/entities/user.entity'

@Entity({ name: 'auth_sessions' })
export class AuthSessionEntity {
  @PrimaryColumn({ name: 'token_hash', type: 'char', length: 64 })
  tokenHash!: string

  @Column({ name: 'user_id', type: 'varchar', length: 32 })
  userId!: string

  @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date

  @Column({ name: 'last_activity_at', type: 'timestamptz' })
  lastActivityAt!: Date

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
