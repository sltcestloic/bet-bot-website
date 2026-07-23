import { BadRequestException, Injectable } from '@nestjs/common'

import { type DashboardFilters, DashboardRepository } from '@/server/dashboard/repositories/dashboard.repository'
import { AdminAccessService } from '@/server/dashboard/services/admin-access.service'
import { DashboardAccessService } from '@/server/dashboard/services/dashboard-access.service'
import { DashboardAchievementService } from '@/server/dashboard/services/dashboard-achievement.service'
import { DashboardCacheService } from '@/server/dashboard/services/dashboard-cache.service'
import { calculateStreaks } from '@/server/dashboard/statistics/dashboard-statistics'
import type { DashboardSeason } from '@/server/dashboard/types/dashboard.types'

@Injectable()
export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository,
    private readonly access: DashboardAccessService,
    private readonly adminAccess: AdminAccessService,
    private readonly cache: DashboardCacheService,
    private readonly achievements: DashboardAchievementService,
  ) {}

  async getBootstrap(discordId: string) {
    return {
      guilds: await this.repository.listGuilds(discordId),
      isAdmin: this.adminAccess.isOwner(discordId),
    }
  }

  async getPlayerHud(discordId: string, guildId: string) {
    await this.access.assertGuildAccess(discordId, guildId)
    const season = await this.resolveSeason()
    return { season, account: await this.repository.getAccount(discordId, guildId, season?.id ?? null) }
  }

  async getOverview(discordId: string, guildId: string, seasonValue?: string, refresh = false, evaluateAchievements = true) {
    await this.access.assertGuildAccess(discordId, guildId)
    const season = await this.resolveSeason(seasonValue)
    const cached = await this.cache.getOrLoad(
      `overview:${discordId}:${guildId}:${season?.id ?? 'all'}`,
      () => this.loadOverview(discordId, guildId, season),
      refresh,
    )
    const celebration = evaluateAchievements
      ? await this.achievements.evaluate(discordId, guildId, season?.id ?? null, {
          wins: cached.data.metrics.wins,
          settled: cached.data.metrics.settled,
          largestNetWin: cached.data.metrics.largestNetWin,
          highestWinningOdds: cached.data.metrics.highestWinningOdds,
          longestWinning: cached.data.streaks.longestWinning,
          rank: cached.data.rank?.rank,
        })
      : null
    return { ...cached, data: { ...cached.data, celebration } }
  }

  async getPerformance(discordId: string, guildId: string, seasonValue?: string, refresh = false, filters: DashboardFilters = {}) {
    await this.access.assertGuildAccess(discordId, guildId)
    const season = await this.resolveSeason(seasonValue)
    validateFilters(filters)
    return this.cache.getOrLoad(
      `performance:${discordId}:${guildId}:${season?.id ?? 'all'}:${JSON.stringify(filters)}`,
      () => this.loadPerformance(discordId, guildId, season, filters),
      refresh,
    )
  }

  async getHistory(discordId: string, guildId: string, seasonValue?: string, filters: DashboardFilters = {}, cursor?: string) {
    await this.access.assertGuildAccess(discordId, guildId)
    const season = await this.resolveSeason(seasonValue)
    validateFilters(filters)
    const numericCursor = cursor ? Number(cursor) : undefined
    if (cursor && !Number.isInteger(numericCursor)) throw new BadRequestException('Invalid cursor')
    const rows = await this.repository.getTickets(discordId, guildId, season?.id ?? null, { filters, limit: 25, cursor: numericCursor })
    return {
      season,
      seasons: await this.repository.listSeasons(),
      tickets: rows.slice(0, 25),
      nextCursor: rows.length > 25 ? String(rows[24].id) : null,
    }
  }

  async getEconomy(discordId: string, guildId: string, seasonValue?: string, cursor?: string) {
    await this.access.assertGuildAccess(discordId, guildId)
    const season = await this.resolveSeason(seasonValue)
    const numericCursor = cursor ? Number(cursor) : undefined
    if (cursor && !Number.isInteger(numericCursor)) throw new BadRequestException('Invalid cursor')
    const rows = await this.repository.getLedger(discordId, guildId, season?.id ?? null, 25, numericCursor)
    const summary = await this.repository.getEconomySummary(discordId, guildId, season?.id ?? null)
    const hasMore = rows.length > 25
    return {
      season,
      seasons: await this.repository.listSeasons(),
      account: await this.repository.getAccount(discordId, guildId, season?.id ?? null),
      entries: rows.slice(0, 25),
      nextCursor: hasMore ? String(rows[24].id) : null,
      ...summary,
    }
  }

  async getActivity(discordId: string, guildId: string, days = 30) {
    await this.access.assertGuildAccess(discordId, guildId)
    return { days: await this.repository.getActivity(discordId, guildId, days) }
  }

  async getLeaderboards(discordId: string, guildId: string, seasonValue?: string) {
    await this.access.assertGuildAccess(discordId, guildId)
    const season = await this.resolveSeason(seasonValue)
    if (!season) {
      const metrics = ['profit', 'wins', 'winRate', 'roi'] as const
      const [rows, longest] = await Promise.all([
        Promise.all(metrics.map(metric => this.repository.getAllTimeLeaderboard(guildId, metric, discordId))),
        this.repository.getStreakLeaderboard(guildId, null, 'longestStreak', discordId),
      ])
      return {
        season: null,
        seasons: await this.repository.listSeasons(),
        boards: withLeaderboardAvatars({
          ...Object.fromEntries(metrics.map((metric, index) => [metric, rows[index]])),
          longestStreak: longest,
        }),
      }
    }
    const metrics = ['balance', 'profit', 'wins', 'winRate', 'roi'] as const
    const [rows, currentStreak, longestStreak] = await Promise.all([
      Promise.all(metrics.map(metric => this.repository.getLeaderboard(guildId, season.id, metric, discordId))),
      this.repository.getStreakLeaderboard(guildId, season.id, 'currentStreak', discordId),
      this.repository.getStreakLeaderboard(guildId, season.id, 'longestStreak', discordId),
    ])
    return {
      season,
      seasons: await this.repository.listSeasons(),
      boards: withLeaderboardAvatars({
        ...Object.fromEntries(metrics.map((metric, index) => [metric, rows[index]])),
        currentStreak,
        longestStreak,
      }),
    }
  }

  async getPublicProfile(viewerDiscordId: string, targetDiscordId: string, guildId: string, seasonValue?: string) {
    await this.access.assertSharedGuild(viewerDiscordId, targetDiscordId, guildId)
    const [profile, overview, performance] = await Promise.all([
      this.repository.getPlayerIdentity(targetDiscordId, guildId),
      this.getOverview(targetDiscordId, guildId, seasonValue, false, false),
      this.getPerformance(targetDiscordId, guildId, seasonValue),
    ])
    return {
      profile: profile
        ? {
            ...profile,
            displayName: profile.globalName ?? profile.username ?? 'Utilisateur Discord',
            avatarUrl: discordAvatarUrl(profile.discordId, profile.avatarHash),
          }
        : null,
      overview: {
        ...overview.data,
        account: null,
        rank: overview.data.rank ? { ...overview.data.rank, value: null } : null,
        celebration: null,
      },
      performance: performance.data,
    }
  }

  async getAdminSummary(discordId: string) {
    this.adminAccess.assertOwner(discordId)
    return this.repository.getAdminSummary()
  }

  async acknowledgeAchievement(discordId: string, guildId: string, seasonValue: string | undefined, key: string) {
    await this.access.assertGuildAccess(discordId, guildId)
    const season = await this.resolveSeason(seasonValue)
    await this.achievements.acknowledge(discordId, guildId, season?.id ?? null, key)
  }

  private async loadOverview(discordId: string, guildId: string, season: DashboardSeason | null) {
    const seasonId = season?.id ?? null
    const [account, metrics, trend, recentTickets, streakRows, leaderboard, previousRank, activity, seasons] = await Promise.all([
      this.repository.getAccount(discordId, guildId, seasonId),
      this.repository.getMetrics(discordId, guildId, seasonId),
      this.repository.getTrend(discordId, guildId, seasonId),
      this.repository.getRecentTickets(discordId, guildId, seasonId, 5),
      this.repository.getSettledForStreaks(discordId, guildId, seasonId),
      season ? this.repository.getLeaderboard(guildId, season.id, 'balance', discordId) : Promise.resolve([]),
      season ? this.repository.getBalanceRankSevenDaysAgo(guildId, season.id, discordId) : Promise.resolve(null),
      this.repository.getActivity(discordId, guildId, 30),
      this.repository.listSeasons(),
    ])
    return {
      season,
      seasons,
      account,
      metrics,
      trend: withCumulativeProfit(trend),
      recentTickets,
      streaks: calculateStreaks(streakRows.map(ticket => ({ ...ticket, stake: 0, odds: 0, payout: 0 }))),
      recentForm: streakRows.slice(0, 10).map(ticket => ticket.outcome),
      rank: leaderboard.find(row => row.isViewer) ?? null,
      previousRank,
      activity: summarizeActivity(activity),
    }
  }

  private async loadPerformance(discordId: string, guildId: string, season: DashboardSeason | null, filters: DashboardFilters) {
    const seasonId = season?.id ?? null
    const [metrics, singles, parlays, trend, sports, competitions, teams, streakRows, breakdowns, seasons, comparison] = await Promise.all([
      this.repository.getMetrics(discordId, guildId, seasonId, filters),
      this.repository.getMetrics(discordId, guildId, seasonId, { ...filters, kind: 'SINGLE' }),
      this.repository.getMetrics(discordId, guildId, seasonId, { ...filters, kind: 'PARLAY' }),
      this.repository.getTrend(discordId, guildId, seasonId, filters),
      this.repository.getSports(discordId, guildId, seasonId),
      this.repository.getCategories(discordId, guildId, seasonId, 'competition'),
      this.repository.getCategories(discordId, guildId, seasonId, 'team'),
      this.repository.getSettledForStreaks(discordId, guildId, seasonId),
      this.repository.getPerformanceBreakdowns(discordId, guildId, seasonId, filters),
      this.repository.listSeasons(),
      filters.from && filters.to ? this.getPreviousPeriodMetrics(discordId, guildId, seasonId, filters) : Promise.resolve(null),
    ])
    return {
      season,
      seasons,
      metrics,
      singles,
      parlays,
      trend: withCumulativeProfit(trend),
      sports,
      competitions,
      teams,
      streaks: calculateStreaks(streakRows.map(ticket => ({ ...ticket, stake: 0, odds: 0, payout: 0 }))),
      recentForm: streakRows.slice(0, 20).map(ticket => ticket.outcome),
      breakdowns,
      comparison,
    }
  }

  private async resolveSeason(value?: string): Promise<DashboardSeason | null> {
    const seasons = await this.repository.listSeasons()
    if (value === 'all') return null
    if (value) {
      const id = Number(value)
      const selected = seasons.find(season => season.id === id)
      if (!selected) throw new BadRequestException('Unknown season')
      return selected
    }
    return (
      seasons.find(season => season.status === 'ACTIVE') ??
      seasons.find(season => season.status === 'CLOSING') ??
      seasons.find(season => season.status === 'CLOSED') ??
      null
    )
  }

  private getPreviousPeriodMetrics(discordId: string, guildId: string, seasonId: number | null, filters: DashboardFilters) {
    const from = new Date(`${filters.from}T00:00:00Z`)
    const to = new Date(`${filters.to}T00:00:00Z`)
    const duration = Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1
    const previousTo = new Date(from)
    previousTo.setUTCDate(previousTo.getUTCDate() - 1)
    const previousFrom = new Date(previousTo)
    previousFrom.setUTCDate(previousFrom.getUTCDate() - duration + 1)
    return this.repository.getMetrics(discordId, guildId, seasonId, {
      ...filters,
      from: previousFrom.toISOString().slice(0, 10),
      to: previousTo.toISOString().slice(0, 10),
    })
  }
}

function validateFilters(filters: DashboardFilters) {
  validateFilter(filters.kind, ['SINGLE', 'PARLAY'], 'Invalid ticket kind')
  validateFilter(filters.outcome, ['PENDING', 'WON', 'LOST', 'CANCELLED'], 'Invalid outcome')
  filters.outcomes?.forEach(outcome => {
    validateFilter(outcome, ['PENDING', 'WON', 'LOST', 'CANCELLED'], 'Invalid outcomes')
  })
  validateFilter(filters.phase, ['PREMATCH', 'LIVE'], 'Invalid placement phase')
  ;[filters.from, filters.to].forEach(validateDate)
  if (filters.from && filters.to && filters.from > filters.to) throw new BadRequestException('Invalid date range')
  ;[filters.sport, filters.competition, filters.team].forEach(validateLength)
}

function validateFilter(value: string | undefined, allowed: readonly string[], message: string) {
  if (value && !allowed.includes(value)) throw new BadRequestException(message)
}

function validateDate(value: string | undefined) {
  if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Invalid date')
}

function validateLength(value: string | undefined) {
  if (value && value.length > 255) throw new BadRequestException('Filter is too long')
}

function summarizeActivity(activity: { betsPlaced: number; dailyClaims: number }[]) {
  return activity.reduce<{ activeDays: number; betsPlaced: number; dailyClaims: number }>(
    (totals, day) => ({
      activeDays: totals.activeDays + 1,
      betsPlaced: totals.betsPlaced + day.betsPlaced,
      dailyClaims: totals.dailyClaims + day.dailyClaims,
    }),
    { activeDays: 0, betsPlaced: 0, dailyClaims: 0 },
  )
}

function withCumulativeProfit<T extends { profit: number }>(rows: T[]) {
  let cumulativeProfit = 0
  return rows.map(row => ({ ...row, cumulativeProfit: (cumulativeProfit += row.profit) }))
}

function discordAvatarUrl(discordId: string, avatarHash: string | null) {
  if (avatarHash) return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=128`
  const index = Number((BigInt(discordId) >> 22n) % 6n)
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

function withLeaderboardAvatars<T extends { discordId: string; avatarHash: string | null }>(boards: Record<string, T[]>) {
  return Object.fromEntries(
    Object.entries(boards).map(([metric, rows]) => [
      metric,
      rows.map(row => ({ ...row, avatarUrl: discordAvatarUrl(row.discordId, row.avatarHash) })),
    ]),
  )
}
