import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'

import { AuthModule } from '@/server/auth/auth.module'
import { AppController } from '@/server/dashboard/controllers/app.controller'
import { DashboardController } from '@/server/dashboard/controllers/dashboard.controller'
import { BotDatabaseService } from '@/server/dashboard/database/bot-database.service'
import { DashboardAchievementEntity } from '@/server/dashboard/entities/dashboard-achievement.entity'
import { DashboardRepository } from '@/server/dashboard/repositories/dashboard.repository'
import { AdminAccessService } from '@/server/dashboard/services/admin-access.service'
import { DashboardService } from '@/server/dashboard/services/dashboard.service'
import { DashboardAccessService } from '@/server/dashboard/services/dashboard-access.service'
import { DashboardAchievementService } from '@/server/dashboard/services/dashboard-achievement.service'
import { DashboardCacheService } from '@/server/dashboard/services/dashboard-cache.service'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([DashboardAchievementEntity])],
  controllers: [DashboardController, AppController],
  providers: [
    BotDatabaseService,
    DashboardRepository,
    DashboardCacheService,
    DashboardService,
    {
      provide: DashboardAchievementService,
      inject: [getRepositoryToken(DashboardAchievementEntity)],
      useFactory: (repository: Repository<DashboardAchievementEntity>) => new DashboardAchievementService(repository),
    },
    {
      provide: DashboardAccessService,
      inject: [DashboardRepository],
      useFactory: (repository: DashboardRepository) => new DashboardAccessService(repository),
    },
    {
      provide: AdminAccessService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => new AdminAccessService(config.getOrThrow<string>('ADMIN_DISCORD_ID')),
    },
  ],
})
export class DashboardModule {}
