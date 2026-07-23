import { Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common'

import { CurrentUser } from '@/server/auth/decorators/current-user.decorator'
import { SessionAuthGuard } from '@/server/auth/guards/session-auth.guard'
import type { DashboardFilters } from '@/server/dashboard/repositories/dashboard.repository'
import { DashboardService } from '@/server/dashboard/services/dashboard.service'
import type { UserEntity } from '@/server/users/entities/user.entity'

@Controller('dashboard')
@UseGuards(SessionAuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('bootstrap')
  getBootstrap(@CurrentUser() user: UserEntity) {
    return this.dashboard.getBootstrap(user.id)
  }

  @Get('guilds/:guildId/overview')
  getOverview(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Query('season') season?: string,
    @Query('refresh') refresh?: string,
  ) {
    return this.dashboard.getOverview(user.id, guildId, season, refresh === 'true')
  }

  @Get('guilds/:guildId/performance')
  getPerformance(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Query() query: DashboardFilters & { season?: string; refresh?: string },
  ) {
    const { season, refresh, ...filters } = query
    return this.dashboard.getPerformance(user.id, guildId, season, refresh === 'true', filters)
  }

  @Get('guilds/:guildId/history')
  getHistory(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Query() query: DashboardFilters & { season?: string; cursor?: string },
  ) {
    const { season, cursor, ...filters } = query
    return this.dashboard.getHistory(user.id, guildId, season, filters, cursor)
  }

  @Get('guilds/:guildId/economy')
  getEconomy(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Query('season') season?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.dashboard.getEconomy(user.id, guildId, season, cursor)
  }

  @Get('guilds/:guildId/activity')
  getActivity(@CurrentUser() user: UserEntity, @Param('guildId') guildId: string, @Query('days') days?: string) {
    return this.dashboard.getActivity(user.id, guildId, days ? Number(days) : 30)
  }

  @Get('guilds/:guildId/leaderboards')
  getLeaderboards(@CurrentUser() user: UserEntity, @Param('guildId') guildId: string, @Query('season') season?: string) {
    return this.dashboard.getLeaderboards(user.id, guildId, season)
  }

  @Get('guilds/:guildId/players/:discordId')
  getPublicProfile(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Param('discordId') discordId: string,
    @Query('season') season?: string,
  ) {
    return this.dashboard.getPublicProfile(user.id, discordId, guildId, season)
  }

  @Get('admin/summary')
  getAdminSummary(@CurrentUser() user: UserEntity) {
    return this.dashboard.getAdminSummary(user.id)
  }

  @Post('guilds/:guildId/achievements/:key/acknowledge')
  @HttpCode(204)
  async acknowledgeAchievement(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Param('key') key: string,
    @Query('season') season?: string,
  ) {
    await this.dashboard.acknowledgeAchievement(user.id, guildId, season, key)
  }
}
