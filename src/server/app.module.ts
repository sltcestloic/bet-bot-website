import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'

import { AuthModule } from '@/server/auth/auth.module'
import { validateEnvironment } from '@/server/common/config/environment'
import { DashboardModule } from '@/server/dashboard/dashboard.module'
import { DatabaseModule } from '@/server/database/database.module'
import { HealthModule } from '@/server/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot(),
    DatabaseModule,
    AuthModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
