import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { AuthSessionEntity } from '@/server/auth/entities/auth-session.entity'

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id!: string

  @Column({ type: 'varchar', length: 64 })
  username!: string

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName!: string

  @Column({ name: 'avatar_hash', type: 'varchar', length: 255, nullable: true })
  avatarHash!: string | null

  @Column({ type: 'varchar', length: 4, default: '0' })
  discriminator!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date

  @OneToMany(() => AuthSessionEntity, (session) => session.user)
  sessions!: AuthSessionEntity[]
}
