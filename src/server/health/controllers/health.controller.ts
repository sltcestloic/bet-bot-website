import { Controller, Get } from '@nestjs/common'
import { HealthService } from '@/server/health/services/health.service'

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  check() {
    return this.health.check()
  }
}
