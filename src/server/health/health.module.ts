import { Module } from '@nestjs/common'
import { HealthController } from '@/server/health/controllers/health.controller'
import { HealthService } from '@/server/health/services/health.service'

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
