import { Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common'

import { CurrentUser } from '@/server/auth/decorators/current-user.decorator'
import { SessionAuthGuard } from '@/server/auth/guards/session-auth.guard'
import type { DashboardFilters } from '@/server/dashboard/repositories/dashboard.repository'
import { DashboardService } from '@/server/dashboard/services/dashboard.service'
import type { UserEntity } from '@/server/users/entities/user.entity'

type TicketView = 'active' | 'settled' | 'all'
export type GameStatsTab = 'performance' | 'affinities' | 'economy' | 'activity'

export function getTicketViewFilters(view?: string): Pick<DashboardFilters, 'outcome' | 'outcomes'> {
  if (!view || view === 'active') return { outcome: 'PENDING' }
  if (view === 'settled') return { outcomes: ['WON', 'LOST', 'CANCELLED'] }
  return {}
}

export function getStatsTab(tab?: string): GameStatsTab {
  return tab === 'affinities' || tab === 'economy' || tab === 'activity' ? tab : 'performance'
}

@Controller('app')
@UseGuards(SessionAuthGuard)
export class AppController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('bootstrap')
  getBootstrap(@CurrentUser() user: UserEntity) {
    return this.dashboard.getBootstrap(user.id)
  }

  @Get('guilds/:guildId/hud')
  getHud(@CurrentUser() user: UserEntity, @Param('guildId') guildId: string) {
    return this.dashboard.getPlayerHud(user.id, guildId)
  }

  @Get('guilds/:guildId/profile')
  async getProfile(@CurrentUser() user: UserEntity, @Param('guildId') guildId: string, @Query('refresh') refresh?: string) {
    const [overview, leaderboards, activeTickets, recentResults] = await Promise.all([
      this.dashboard.getOverview(user.id, guildId, undefined, refresh === 'true'),
      this.dashboard.getLeaderboards(user.id, guildId),
      this.dashboard.getHistory(user.id, guildId, undefined, getTicketViewFilters('active')),
      this.dashboard.getHistory(user.id, guildId, undefined, getTicketViewFilters('settled')),
    ])
    return {
      ...overview,
      data: {
        ...overview.data,
        activeTickets: activeTickets.tickets,
        recentResults: recentResults.tickets.slice(0, 5),
        leaderboards: leaderboards.boards,
      },
    }
  }

  @Get('guilds/:guildId/season')
  async getSeason(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Query('season') season?: string,
    @Query('refresh') refresh?: string,
  ) {
    const [overview, performance] = await Promise.all([
      this.dashboard.getOverview(user.id, guildId, season, refresh === 'true'),
      this.dashboard.getPerformance(user.id, guildId, season, refresh === 'true'),
    ])
    return { overview: overview.data, performance: performance.data, generatedAt: overview.generatedAt }
  }

  @Get('guilds/:guildId/tickets')
  async getTickets(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Query() query: DashboardFilters & { season?: string; cursor?: string; view?: TicketView },
  ) {
    const { season, cursor, view, outcomes: _outcomes, ...filters } = query
    const [history, performance] = await Promise.all([
      this.dashboard.getHistory(user.id, guildId, season, { ...filters, ...getTicketViewFilters(view) }, cursor),
      this.dashboard.getPerformance(user.id, guildId, season),
    ])
    return {
      ...history,
      filterOptions: {
        sports: performance.data.sports.map(item => item.sport),
        competitions: performance.data.competitions.map(item => item.name),
        teams: performance.data.teams.map(item => item.name),
      },
    }
  }

  @Get('guilds/:guildId/leaderboard')
  getLeaderboard(@CurrentUser() user: UserEntity, @Param('guildId') guildId: string, @Query('season') season?: string) {
    return this.dashboard.getLeaderboards(user.id, guildId, season)
  }

  @Get('guilds/:guildId/stats')
  getStats(
    @CurrentUser() user: UserEntity,
    @Param('guildId') guildId: string,
    @Query('tab') tab?: string,
    @Query('season') season?: string,
    @Query('refresh') refresh?: string,
  ) {
    const selectedTab = getStatsTab(tab)
    if (selectedTab === 'economy') return this.dashboard.getEconomy(user.id, guildId, season)
    if (selectedTab === 'activity') return this.dashboard.getActivity(user.id, guildId)
    return this.dashboard.getPerformance(user.id, guildId, season, refresh === 'true')
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

  @Post('guilds/:guildId/achievements/:key/acknowledge')
  @HttpCode(204)
  acknowledgeAchievement(@CurrentUser() user: UserEntity, @Param('guildId') guildId: string, @Param('key') key: string) {
    return this.dashboard.acknowledgeAchievement(user.id, guildId, undefined, key)
  }
}
