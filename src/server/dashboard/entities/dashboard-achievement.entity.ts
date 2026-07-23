import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'dashboard_achievements' })
export class DashboardAchievementEntity {
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 32 })
  userId!: string

  @PrimaryColumn({ name: 'guild_id', type: 'varchar', length: 20 })
  guildId!: string

  @PrimaryColumn({ name: 'season_key', type: 'varchar', length: 20 })
  seasonKey!: string

  @PrimaryColumn({ type: 'varchar', length: 64 })
  key!: string

  @Column({ name: 'best_value', type: 'double precision' })
  bestValue!: number

  @Column({ type: 'boolean', default: false })
  pending!: boolean

  @Column({ name: 'pending_title', type: 'varchar', length: 128, nullable: true })
  pendingTitle!: string | null

  @Column({ name: 'pending_detail', type: 'varchar', length: 255, nullable: true })
  pendingDetail!: string | null

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
