import { Injectable } from '@nestjs/common'

import { BotDatabaseService } from '@/server/dashboard/database/bot-database.service'
import { DashboardAdminRepository } from '@/server/dashboard/repositories/dashboard-admin.repository'
import { DashboardRankingRepository } from '@/server/dashboard/repositories/dashboard-ranking.repository'
import { buildTicketQuery, type TicketQueryOptions } from '@/server/dashboard/repositories/dashboard-ticket-query'
import type { GuildAccessRepository } from '@/server/dashboard/services/dashboard-access.service'
import type { DashboardGuild, DashboardSeason, DashboardTicket, MetricSummary } from '@/server/dashboard/types/dashboard.types'

interface CountRow {
  count: number
}
export interface DashboardFilters {
  from?: string
  to?: string
  kind?: string
  outcome?: string
  outcomes?: string[]
  sport?: string
  competition?: string
  team?: string
  phase?: string
}

@Injectable()
export class DashboardRepository implements GuildAccessRepository {
  private readonly admin: DashboardAdminRepository
  private readonly ranking: DashboardRankingRepository

  constructor(private readonly database: BotDatabaseService) {
    this.admin = new DashboardAdminRepository(database)
    this.ranking = new DashboardRankingRepository(database)
  }

  async hasGuildAccess(discordId: string, guildId: string) {
    const [row] = await this.database.query<CountRow>(
      `
      SELECT COUNT(*)::int AS count
      FROM "GuildUser" gu
      JOIN "Guild" g ON g.id = gu."guildId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND gu."leftAt" IS NULL AND g."isActive" = true
    `,
      [discordId, guildId],
    )
    return row.count === 1
  }

  listGuilds(discordId: string) {
    return this.database.query<DashboardGuild>(
      `
      SELECT g.id, g.name, g."iconHash", g."memberCount", g."lastSyncedAt"
      FROM "GuildUser" gu
      JOIN "Guild" g ON g.id = gu."guildId"
      WHERE gu."discordId" = $1 AND gu."leftAt" IS NULL AND g."isActive" = true
      ORDER BY lower(g.name), g.id
      LIMIT 100
    `,
      [discordId],
    )
  }

  listSeasons() {
    return this.database.query<DashboardSeason>(`
      SELECT id, number, title, status, "startsAt", "bettingClosesAt", "closedAt"
      FROM "Season"
      ORDER BY number DESC
      LIMIT 100
    `)
  }

  async getPlayerIdentity(discordId: string, guildId: string) {
    const [row] = await this.database.query<{
      discordId: string
      username: string | null
      globalName: string | null
      avatarHash: string | null
    }>(
      `
      SELECT du."discordId", du.username, du."globalName", du."avatarHash"
      FROM "GuildUser" gu JOIN "DiscordUser" du ON du."discordId" = gu."discordId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2 AND gu."leftAt" IS NULL LIMIT 1
    `,
      [discordId, guildId],
    )
    return row ?? null
  }

  async getAccount(discordId: string, guildId: string, seasonId: number | null) {
    const [row] = await this.database.query<{
      userId: number
      balance: number | null
      activeStake: number
      participatedAt: string | null
      isBanned: boolean
    }>(
      `
      SELECT gu.id AS "userId", sa.balance, sa."participatedAt", gu."isBanned",
        COALESCE((SELECT SUM(b.stake) FROM "Bet" b WHERE b."userId" = gu.id AND ($3::int IS NULL OR b."seasonId" = $3)), 0)::int
        + COALESCE((SELECT SUM(p.stake) FROM "Parlay" p WHERE p."userId" = gu.id AND ($3::int IS NULL OR p."seasonId" = $3)), 0)::int AS "activeStake"
      FROM "GuildUser" gu
      LEFT JOIN "SeasonAccount" sa ON sa."userId" = gu.id AND sa."seasonId" = $3
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
      LIMIT 1
    `,
      [discordId, guildId, seasonId],
    )
    return row ?? null
  }

  async getMetrics(discordId: string, guildId: string, seasonId: number | null, filters: DashboardFilters = {}): Promise<MetricSummary> {
    const [row] = await this.database.query<MetricSummary>(
      `
      SELECT
        COUNT(*)::int AS placed,
        COUNT(*) FILTER (WHERE h.outcome = 'PENDING')::int AS pending,
        COUNT(*) FILTER (WHERE h.outcome = 'CANCELLED')::int AS cancelled,
        COUNT(*) FILTER (WHERE h.outcome IN ('WON', 'LOST'))::int AS settled,
        COUNT(*) FILTER (WHERE h.outcome = 'WON')::int AS wins,
        COUNT(*) FILTER (WHERE h.outcome = 'LOST')::int AS losses,
        COALESCE(SUM(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS "totalStaked",
        COALESCE(SUM(h.payout) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS "grossPayout",
        COALESCE(SUM(h.payout - h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS "realizedProfit",
        CASE WHEN COUNT(*) FILTER (WHERE h.outcome IN ('WON', 'LOST')) > 0
          THEN COUNT(*) FILTER (WHERE h.outcome = 'WON')::float / COUNT(*) FILTER (WHERE h.outcome IN ('WON', 'LOST')) END AS "winRate",
        CASE WHEN COALESCE(SUM(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0) > 0
          THEN SUM(h.payout - h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST'))::float / SUM(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')) END AS roi,
        AVG(h.odds) FILTER (WHERE h.outcome IN ('WON', 'LOST'))::float AS "averageOdds",
        AVG(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST'))::float AS "averageStake",
        MAX(h.odds) FILTER (WHERE h.outcome = 'WON')::float AS "highestWinningOdds",
        MAX(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST'))::int AS "largestStake",
        MAX(h.payout) FILTER (WHERE h.outcome IN ('WON', 'LOST'))::int AS "largestPayout",
        MAX(h.payout - h.stake) FILTER (WHERE h.outcome = 'WON')::int AS "largestNetWin"
      FROM "BetHistoryEntry" h
      JOIN "GuildUser" gu ON gu.id = h."userId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND ($3::int IS NULL OR h."seasonId" = $3)
        AND ($4::text IS NULL OR h.kind::text = $4)
        AND ($5::text IS NULL OR h."placedAt" >= ($5::date AT TIME ZONE 'Europe/Paris'))
        AND ($6::text IS NULL OR h."placedAt" < (($6::date + 1) AT TIME ZONE 'Europe/Paris'))
        AND ($7::text IS NULL OR h.outcome::text = $7)
        AND (($8::text IS NULL AND $9::text IS NULL AND $10::text IS NULL AND $11::text IS NULL) OR EXISTS (
          SELECT 1 FROM "BetHistoryLeg" filtered_leg
          WHERE filtered_leg."historyEntryId" = h.id
            AND ($8::text IS NULL OR filtered_leg.sport::text = $8)
            AND ($9::text IS NULL OR filtered_leg.competition = $9)
            AND ($10::text IS NULL OR filtered_leg.team1 = $10 OR filtered_leg.team2 = $10)
            AND ($11::text IS NULL OR filtered_leg."placementPhase"::text = $11)
        ))
    `,
      [
        discordId,
        guildId,
        seasonId,
        filters.kind ?? null,
        filters.from ?? null,
        filters.to ?? null,
        filters.outcome ?? null,
        filters.sport ?? null,
        filters.competition ?? null,
        filters.team ?? null,
        filters.phase ?? null,
      ],
    )
    return normalizeMetrics(row)
  }

  getTrend(discordId: string, guildId: string, seasonId: number | null, filters: DashboardFilters = {}) {
    return this.database.query<{ date: string; profit: number; stake: number; payout: number; tickets: number }>(
      `
      SELECT to_char((h."placedAt" AT TIME ZONE 'Europe/Paris')::date, 'YYYY-MM-DD') AS date,
        COALESCE(SUM(h.payout - h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS profit,
        COALESCE(SUM(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS stake,
        COALESCE(SUM(h.payout) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS payout,
        COUNT(*)::int AS tickets
      FROM "BetHistoryEntry" h
      JOIN "GuildUser" gu ON gu.id = h."userId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND ($3::int IS NULL OR h."seasonId" = $3)
        AND ($4::text IS NULL OR h.kind::text = $4)
        AND ($5::text IS NULL OR h."placedAt" >= ($5::date AT TIME ZONE 'Europe/Paris'))
        AND ($6::text IS NULL OR h."placedAt" < (($6::date + 1) AT TIME ZONE 'Europe/Paris'))
        AND ($7::text IS NULL OR h.outcome::text = $7)
        AND (($8::text IS NULL AND $9::text IS NULL AND $10::text IS NULL AND $11::text IS NULL) OR EXISTS (
          SELECT 1 FROM "BetHistoryLeg" filtered_leg
          WHERE filtered_leg."historyEntryId" = h.id
            AND ($8::text IS NULL OR filtered_leg.sport::text = $8)
            AND ($9::text IS NULL OR filtered_leg.competition = $9)
            AND ($10::text IS NULL OR filtered_leg.team1 = $10 OR filtered_leg.team2 = $10)
            AND ($11::text IS NULL OR filtered_leg."placementPhase"::text = $11)
        ))
      GROUP BY 1 ORDER BY 1
      LIMIT 370
    `,
      [
        discordId,
        guildId,
        seasonId,
        filters.kind ?? null,
        filters.from ?? null,
        filters.to ?? null,
        filters.outcome ?? null,
        filters.sport ?? null,
        filters.competition ?? null,
        filters.team ?? null,
        filters.phase ?? null,
      ],
    )
  }

  getRecentTickets(discordId: string, guildId: string, seasonId: number | null, limit = 5) {
    return this.database.query<DashboardTicket>(
      `
      SELECT h.id, h.kind, h.outcome, h.stake, h.odds, h.payout, h."placedAt", h."settledAt",
        EXISTS (SELECT 1 FROM "BetHistoryLeg" correction_leg JOIN "MatchResultCorrection" correction ON correction."matchId" = correction_leg."matchId" WHERE correction_leg."historyEntryId" = h.id) AS "hasCorrection",
        COALESCE(json_agg(json_build_object(
          'id', leg.id, 'position', leg.position, 'optionName', leg."optionName", 'odds', leg.odds,
          'placementPhase', leg."placementPhase", 'outcome', leg.outcome, 'sport', leg.sport,
          'competition', leg.competition, 'team1', leg.team1, 'team2', leg.team2,
          'startsAt', leg."startsAt", 'scoreTeam1', match."scoreTeam1", 'scoreTeam2', match."scoreTeam2",
          'hasCorrection', EXISTS (SELECT 1 FROM "MatchResultCorrection" correction WHERE correction."matchId" = leg."matchId")
        ) ORDER BY leg.position) FILTER (WHERE leg.id IS NOT NULL), '[]') AS legs
      FROM "BetHistoryEntry" h
      JOIN "GuildUser" gu ON gu.id = h."userId"
      LEFT JOIN "BetHistoryLeg" leg ON leg."historyEntryId" = h.id
      LEFT JOIN "Match" match ON match.id = leg."matchId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND ($3::int IS NULL OR h."seasonId" = $3)
      GROUP BY h.id
      ORDER BY h."placedAt" DESC, h.id DESC
      LIMIT $4
    `,
      [discordId, guildId, seasonId, limit],
    )
  }

  getTickets(discordId: string, guildId: string, seasonId: number | null, options: TicketQueryOptions) {
    const { conditions, values } = buildTicketQuery(discordId, guildId, seasonId, options)
    return this.database.query<DashboardTicket>(
      `
      SELECT h.id, h.kind, h.outcome, h.stake, h.odds, h.payout, h."placedAt", h."settledAt",
        EXISTS (SELECT 1 FROM "BetHistoryLeg" correction_leg JOIN "MatchResultCorrection" correction ON correction."matchId" = correction_leg."matchId" WHERE correction_leg."historyEntryId" = h.id) AS "hasCorrection",
        COALESCE(json_agg(json_build_object('id', leg.id, 'position', leg.position, 'optionName', leg."optionName", 'odds', leg.odds, 'placementPhase', leg."placementPhase", 'outcome', leg.outcome, 'sport', leg.sport, 'competition', leg.competition, 'team1', leg.team1, 'team2', leg.team2, 'startsAt', leg."startsAt", 'scoreTeam1', match."scoreTeam1", 'scoreTeam2', match."scoreTeam2", 'hasCorrection', EXISTS (SELECT 1 FROM "MatchResultCorrection" correction WHERE correction."matchId" = leg."matchId")) ORDER BY leg.position) FILTER (WHERE leg.id IS NOT NULL), '[]') AS legs
      FROM "BetHistoryEntry" h JOIN "GuildUser" gu ON gu.id = h."userId"
      LEFT JOIN "BetHistoryLeg" leg ON leg."historyEntryId" = h.id LEFT JOIN "Match" match ON match.id = leg."matchId"
      WHERE ${conditions.join(' AND ')}
      GROUP BY h.id ORDER BY h."placedAt" DESC, h.id DESC LIMIT $${values.length}
    `,
      values,
    )
  }

  getSettledForStreaks(discordId: string, guildId: string, seasonId: number | null) {
    return this.database.query<{ id: number; seasonId: number; outcome: 'WON' | 'LOST'; settledAt: Date }>(
      `
      SELECT h.id, h."seasonId", h.outcome, h."settledAt"
      FROM "BetHistoryEntry" h
      JOIN "GuildUser" gu ON gu.id = h."userId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND ($3::int IS NULL OR h."seasonId" = $3)
        AND h.outcome IN ('WON', 'LOST')
      ORDER BY h."settledAt" DESC, h.id DESC
      LIMIT 10000
    `,
      [discordId, guildId, seasonId],
    )
  }

  getSports(discordId: string, guildId: string, seasonId: number | null) {
    return this.database.query<{
      sport: string
      selections: number
      wins: number
      losses: number
      winRate: number | null
    }>(
      `
      SELECT leg.sport::text AS sport, COUNT(*)::int AS selections,
        COUNT(*) FILTER (WHERE leg.outcome = 'WON')::int AS wins,
        COUNT(*) FILTER (WHERE leg.outcome = 'LOST')::int AS losses,
        CASE WHEN COUNT(*) FILTER (WHERE leg.outcome IN ('WON', 'LOST')) > 0
          THEN COUNT(*) FILTER (WHERE leg.outcome = 'WON')::float / COUNT(*) FILTER (WHERE leg.outcome IN ('WON', 'LOST')) END AS "winRate"
      FROM "BetHistoryLeg" leg
      JOIN "BetHistoryEntry" h ON h.id = leg."historyEntryId"
      JOIN "GuildUser" gu ON gu.id = h."userId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND ($3::int IS NULL OR h."seasonId" = $3)
      GROUP BY leg.sport ORDER BY selections DESC
      LIMIT 50
    `,
      [discordId, guildId, seasonId],
    )
  }

  getCategories(discordId: string, guildId: string, seasonId: number | null, field: 'competition' | 'team') {
    const expression =
      field === 'competition'
        ? 'leg.competition'
        : 'CASE WHEN leg."optionName" = leg.team1 THEN leg.team1 WHEN leg."optionName" = leg.team2 THEN leg.team2 END'
    const selectedTeamCondition = field === 'team' ? 'AND (leg."optionName" = leg.team1 OR leg."optionName" = leg.team2)' : ''
    return this.database.query<{ name: string; selections: number; wins: number; losses: number; winRate: number | null }>(
      `
      SELECT ${expression} AS name, COUNT(*)::int AS selections,
        COUNT(*) FILTER (WHERE leg.outcome = 'WON')::int AS wins,
        COUNT(*) FILTER (WHERE leg.outcome = 'LOST')::int AS losses,
        CASE WHEN COUNT(*) FILTER (WHERE leg.outcome IN ('WON', 'LOST')) > 0
          THEN COUNT(*) FILTER (WHERE leg.outcome = 'WON')::float / COUNT(*) FILTER (WHERE leg.outcome IN ('WON', 'LOST')) END AS "winRate"
      FROM "BetHistoryLeg" leg
      JOIN "BetHistoryEntry" h ON h.id = leg."historyEntryId"
      JOIN "GuildUser" gu ON gu.id = h."userId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND ($3::int IS NULL OR h."seasonId" = $3)
        ${selectedTeamCondition}
      GROUP BY ${expression} ORDER BY selections DESC, name
      LIMIT 100
    `,
      [discordId, guildId, seasonId],
    )
  }

  async getPerformanceBreakdowns(discordId: string, guildId: string, seasonId: number | null, filters: DashboardFilters = {}) {
    const parameters = [
      discordId,
      guildId,
      seasonId,
      filters.from ?? null,
      filters.to ?? null,
      filters.kind ?? null,
      filters.outcome ?? null,
      filters.sport ?? null,
      filters.competition ?? null,
      filters.team ?? null,
      filters.phase ?? null,
    ]
    const scope = `gu."discordId" = $1 AND gu."guildId" = $2 AND ($3::int IS NULL OR h."seasonId" = $3)
      AND ($4::text IS NULL OR h."placedAt" >= ($4::date AT TIME ZONE 'Europe/Paris'))
      AND ($5::text IS NULL OR h."placedAt" < (($5::date + 1) AT TIME ZONE 'Europe/Paris'))
      AND ($6::text IS NULL OR h.kind::text = $6)
      AND ($7::text IS NULL OR h.outcome::text = $7)
      AND (($8::text IS NULL AND $9::text IS NULL AND $10::text IS NULL AND $11::text IS NULL) OR EXISTS (
        SELECT 1 FROM "BetHistoryLeg" filtered_leg WHERE filtered_leg."historyEntryId" = h.id
          AND ($8::text IS NULL OR filtered_leg.sport::text = $8)
          AND ($9::text IS NULL OR filtered_leg.competition = $9)
          AND ($10::text IS NULL OR filtered_leg.team1 = $10 OR filtered_leg.team2 = $10)
          AND ($11::text IS NULL OR filtered_leg."placementPhase"::text = $11)
      ))`
    const [odds, stakes, weekdays, hours, phases, sportFinance] = await Promise.all([
      this.database.query<{ bucket: string; settled: number; wins: number; winRate: number | null }>(
        `
        SELECT CASE WHEN h.odds < 1.5 THEN '< 1,50' WHEN h.odds < 2 THEN '1,50–1,99' WHEN h.odds < 3 THEN '2,00–2,99' WHEN h.odds < 5 THEN '3,00–4,99' ELSE '≥ 5,00' END AS bucket,
          COUNT(*)::int AS settled, COUNT(*) FILTER (WHERE h.outcome = 'WON')::int AS wins,
          COUNT(*) FILTER (WHERE h.outcome = 'WON')::float / NULLIF(COUNT(*), 0) AS "winRate"
        FROM "BetHistoryEntry" h JOIN "GuildUser" gu ON gu.id = h."userId" WHERE ${scope} AND h.outcome IN ('WON','LOST')
        GROUP BY 1 ORDER BY MIN(h.odds)
      `,
        parameters,
      ),
      this.database.query<{
        bucket: string
        minimum: number
        maximum: number | null
        settled: number
        wins: number
        winRate: number | null
      }>(
        `
        WITH scoped AS (SELECT h.* FROM "BetHistoryEntry" h JOIN "GuildUser" gu ON gu.id = h."userId" WHERE ${scope} AND h.outcome IN ('WON','LOST')),
        thresholds AS (SELECT percentile_disc(0.25) WITHIN GROUP (ORDER BY stake) AS q1, percentile_disc(0.5) WITHIN GROUP (ORDER BY stake) AS q2, percentile_disc(0.75) WITHIN GROUP (ORDER BY stake) AS q3, COUNT(*) AS count FROM scoped),
        bucketed AS (SELECT scoped.*, CASE WHEN stake <= q1 THEN 1 WHEN stake <= q2 THEN 2 WHEN stake <= q3 THEN 3 ELSE 4 END AS bucket, q1, q2, q3, count FROM scoped, thresholds)
        SELECT CASE bucket WHEN 1 THEN 'Petite mise' WHEN 2 THEN 'Mise modérée' WHEN 3 THEN 'Mise importante' ELSE 'Très grosse mise' END AS bucket,
          MIN(stake)::int AS minimum, CASE WHEN bucket < 4 THEN MAX(stake)::int END AS maximum, COUNT(*)::int AS settled,
          COUNT(*) FILTER (WHERE outcome = 'WON')::int AS wins, COUNT(*) FILTER (WHERE outcome = 'WON')::float / NULLIF(COUNT(*), 0) AS "winRate"
        FROM bucketed WHERE count >= 20 GROUP BY bucket ORDER BY bucket
      `,
        parameters,
      ),
      this.database.query<{ label: string; settled: number; wins: number; winRate: number | null }>(
        `
        SELECT EXTRACT(ISODOW FROM h."placedAt" AT TIME ZONE 'Europe/Paris')::text AS label, COUNT(*)::int AS settled,
          COUNT(*) FILTER (WHERE h.outcome = 'WON')::int AS wins, COUNT(*) FILTER (WHERE h.outcome = 'WON')::float / NULLIF(COUNT(*), 0) AS "winRate"
        FROM "BetHistoryEntry" h JOIN "GuildUser" gu ON gu.id = h."userId" WHERE ${scope} AND h.outcome IN ('WON','LOST') GROUP BY 1 ORDER BY 1
      `,
        parameters,
      ),
      this.database.query<{ label: string; settled: number; wins: number; winRate: number | null }>(
        `
        SELECT EXTRACT(HOUR FROM h."placedAt" AT TIME ZONE 'Europe/Paris')::text AS label, COUNT(*)::int AS settled,
          COUNT(*) FILTER (WHERE h.outcome = 'WON')::int AS wins, COUNT(*) FILTER (WHERE h.outcome = 'WON')::float / NULLIF(COUNT(*), 0) AS "winRate"
        FROM "BetHistoryEntry" h JOIN "GuildUser" gu ON gu.id = h."userId" WHERE ${scope} AND h.outcome IN ('WON','LOST') GROUP BY 1 ORDER BY 1::int
      `,
        parameters,
      ),
      this.database.query<{ phase: string; settled: number; wins: number; winRate: number | null }>(
        `
        SELECT leg."placementPhase"::text AS phase, COUNT(*)::int AS settled, COUNT(*) FILTER (WHERE leg.outcome = 'WON')::int AS wins,
          COUNT(*) FILTER (WHERE leg.outcome = 'WON')::float / NULLIF(COUNT(*), 0) AS "winRate"
        FROM "BetHistoryLeg" leg JOIN "BetHistoryEntry" h ON h.id = leg."historyEntryId" JOIN "GuildUser" gu ON gu.id = h."userId"
        WHERE ${scope} AND leg.outcome IN ('WON','LOST') GROUP BY leg."placementPhase" ORDER BY phase
      `,
        parameters,
      ),
      this.database.query<{ sport: string; settled: number; stake: number; payout: number; profit: number; roi: number | null }>(
        `
        WITH attributed AS (
          SELECT h.id, h.stake, h.payout, MIN(leg.sport::text) AS sport
          FROM "BetHistoryEntry" h JOIN "GuildUser" gu ON gu.id = h."userId" JOIN "BetHistoryLeg" leg ON leg."historyEntryId" = h.id
          WHERE ${scope} AND h.outcome IN ('WON','LOST') GROUP BY h.id HAVING MIN(leg.sport::text) = MAX(leg.sport::text)
        ) SELECT sport, COUNT(*)::int AS settled, SUM(stake)::int AS stake, SUM(payout)::int AS payout, SUM(payout-stake)::int AS profit,
          SUM(payout-stake)::float / NULLIF(SUM(stake), 0) AS roi FROM attributed GROUP BY sport ORDER BY settled DESC
      `,
        parameters,
      ),
    ])
    return { odds, stakes, weekdays, hours, phases, sportFinance }
  }

  getActivity(discordId: string, guildId: string, days: number) {
    return this.database.query<{ date: string; interactions: number; betsPlaced: number; amountStaked: number; dailyClaims: number }>(
      `
      SELECT to_char(a.date, 'YYYY-MM-DD') AS date, a.interactions, a."betsPlaced", a."amountStaked", a."dailyClaims"
      FROM "UserActivityDay" a
      JOIN "GuildUser" gu ON gu.id = a."userId"
      WHERE gu."discordId" = $1 AND a."guildId" = $2
        AND a.date >= (now() AT TIME ZONE 'Europe/Paris')::date - ($3::int - 1)
      ORDER BY a.date
      LIMIT 370
    `,
      [discordId, guildId, Math.min(Math.max(days, 1), 365)],
    )
  }

  getLedger(discordId: string, guildId: string, seasonId: number | null, limit: number, cursor?: number) {
    return this.database.query<{
      id: number
      type: string
      amount: number
      balanceAfter: number
      historyEntryId: number | null
      occurredAt: string
    }>(
      `
      SELECT transaction.id, transaction.type, transaction.amount, transaction."balanceAfter",
        transaction."historyEntryId", transaction."occurredAt"
      FROM "BalanceTransaction" transaction
      JOIN "GuildUser" gu ON gu.id = transaction."userId"
      WHERE gu."discordId" = $1 AND gu."guildId" = $2
        AND ($3::int IS NULL OR transaction."seasonId" = $3)
        AND ($4::int IS NULL OR transaction.id < $4)
      ORDER BY transaction."occurredAt" DESC, transaction.id DESC
      LIMIT $5
    `,
      [discordId, guildId, seasonId, cursor ?? null, limit + 1],
    )
  }

  async getEconomySummary(discordId: string, guildId: string, seasonId: number | null) {
    const [flows, balanceTrend] = await Promise.all([
      this.database.query<{ type: string; amount: number; volume: number; entries: number }>(
        `
        SELECT transaction.type::text, SUM(transaction.amount)::int AS amount, SUM(ABS(transaction.amount))::int AS volume, COUNT(*)::int AS entries
        FROM "BalanceTransaction" transaction JOIN "GuildUser" gu ON gu.id = transaction."userId"
        WHERE gu."discordId" = $1 AND gu."guildId" = $2 AND ($3::int IS NULL OR transaction."seasonId" = $3)
        GROUP BY transaction.type ORDER BY volume DESC
      `,
        [discordId, guildId, seasonId],
      ),
      this.database.query<{ date: string; balance: number; seasonId: number }>(
        `
        SELECT DISTINCT ON (transaction."seasonId", (transaction."occurredAt" AT TIME ZONE 'Europe/Paris')::date)
          to_char((transaction."occurredAt" AT TIME ZONE 'Europe/Paris')::date, 'YYYY-MM-DD') AS date,
          transaction."balanceAfter" AS balance, transaction."seasonId"
        FROM "BalanceTransaction" transaction JOIN "GuildUser" gu ON gu.id = transaction."userId"
        WHERE gu."discordId" = $1 AND gu."guildId" = $2 AND ($3::int IS NULL OR transaction."seasonId" = $3)
        ORDER BY transaction."seasonId", (transaction."occurredAt" AT TIME ZONE 'Europe/Paris')::date, transaction."occurredAt" DESC, transaction.id DESC
        LIMIT 1000
      `,
        [discordId, guildId, seasonId],
      ),
    ])
    return { flows, balanceTrend }
  }

  getLeaderboard(guildId: string, seasonId: number, metric: string, viewerDiscordId: string) {
    return this.ranking.getLeaderboard(guildId, seasonId, metric, viewerDiscordId)
  }

  getBalanceRankSevenDaysAgo(guildId: string, seasonId: number, viewerDiscordId: string) {
    return this.ranking.getBalanceRankSevenDaysAgo(guildId, seasonId, viewerDiscordId)
  }

  getAllTimeLeaderboard(guildId: string, metric: string, viewerDiscordId: string) {
    return this.ranking.getAllTimeLeaderboard(guildId, metric, viewerDiscordId)
  }

  getStreakLeaderboard(guildId: string, seasonId: number | null, metric: 'currentStreak' | 'longestStreak', viewerDiscordId: string) {
    return this.ranking.getStreakLeaderboard(guildId, seasonId, metric, viewerDiscordId)
  }

  getAdminSummary() {
    return this.admin.getAdminSummary()
  }
}

function normalizeMetrics(metrics: MetricSummary): MetricSummary {
  return {
    ...metrics,
    winRate: metrics.winRate === null ? null : Number(metrics.winRate),
    roi: metrics.roi === null ? null : Number(metrics.roi),
    averageOdds: metrics.averageOdds === null ? null : Number(metrics.averageOdds),
    averageStake: metrics.averageStake === null ? null : Number(metrics.averageStake),
    highestWinningOdds: metrics.highestWinningOdds === null ? null : Number(metrics.highestWinningOdds),
  }
}
