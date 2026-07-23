import type { BotDatabaseService } from '@/server/dashboard/database/bot-database.service'

export class DashboardAdminRepository {
  constructor(private readonly database: BotDatabaseService) {}

  // eslint-disable-next-line max-lines-per-function -- Keeping the parallel read-only audit queries together makes their shared scope explicit.
  async getAdminSummary() {
    const [
      guilds,
      operations,
      corrections,
      activity,
      features,
      subscriptions,
      tasks,
      providers,
      messages,
      anomalyCount,
      guildRows,
      lifecycle,
      anomalies,
      ledgerFlows,
    ] = await Promise.all([
      this.database.query<{ active: number; installed: number; removed: number; memberReach: number }>(`
        SELECT COUNT(*) FILTER (WHERE "isActive")::int AS active,
          COUNT(*)::int AS installed, COUNT(*) FILTER (WHERE NOT "isActive")::int AS removed,
          COALESCE(SUM("memberCount") FILTER (WHERE "isActive"), 0)::int AS "memberReach" FROM "Guild"
      `),
      this.database.query<{ apiRequests: number; apiFailures: number; rateLimits: number; taskRuns: number; taskFailures: number }>(`
        SELECT
          (SELECT COALESCE(SUM(requests), 0)::int FROM "ApiMetricHour" WHERE hour >= now() - interval '30 days') AS "apiRequests",
          (SELECT COALESCE(SUM(failures), 0)::int FROM "ApiMetricHour" WHERE hour >= now() - interval '30 days') AS "apiFailures",
          (SELECT COALESCE(SUM("rateLimits"), 0)::int FROM "ApiMetricHour" WHERE hour >= now() - interval '30 days' AND provider = 'kalshi') AS "rateLimits",
          (SELECT COALESCE(SUM(runs), 0)::int FROM "TaskMetricHour" WHERE hour >= now() - interval '30 days') AS "taskRuns",
          (SELECT COALESCE(SUM(failures), 0)::int FROM "TaskMetricHour" WHERE hour >= now() - interval '30 days') AS "taskFailures"
      `),
      this.database.query<{
        id: number
        matchId: number
        previousScoreTeam1: number
        previousScoreTeam2: number
        correctedScoreTeam1: number
        correctedScoreTeam2: number
        createdAt: string
        team1: string
        team2: string
      }>(`
        SELECT correction.id, correction."matchId", correction."previousScoreTeam1", correction."previousScoreTeam2",
          correction."correctedScoreTeam1", correction."correctedScoreTeam2", correction."createdAt", match.team1, match.team2
        FROM "MatchResultCorrection" correction JOIN "Match" match ON match.id = correction."matchId"
        ORDER BY correction."createdAt" DESC, correction.id DESC LIMIT 25
      `),
      this.database.query<{
        dau: number
        wau: number
        mau: number
        interactions: number
        commands: number
        buttons: number
        modals: number
        selectMenus: number
        betsPlaced: number
        amountStaked: number
        dailyClaims: number
      }>(`
        SELECT
          COUNT(DISTINCT "userId") FILTER (WHERE date = (now() AT TIME ZONE 'Europe/Paris')::date)::int AS dau,
          COUNT(DISTINCT "userId") FILTER (WHERE date >= (now() AT TIME ZONE 'Europe/Paris')::date - 6)::int AS wau,
          COUNT(DISTINCT "userId") FILTER (WHERE date >= (now() AT TIME ZONE 'Europe/Paris')::date - 29)::int AS mau,
          COALESCE(SUM(interactions), 0)::int AS interactions, COALESCE(SUM(commands), 0)::int AS commands,
          COALESCE(SUM(buttons), 0)::int AS buttons, COALESCE(SUM(modals), 0)::int AS modals,
          COALESCE(SUM("selectMenus"), 0)::int AS "selectMenus", COALESCE(SUM("betsPlaced"), 0)::int AS "betsPlaced",
          COALESCE(SUM("amountStaked"), 0)::int AS "amountStaked", COALESCE(SUM("dailyClaims"), 0)::int AS "dailyClaims"
        FROM "UserActivityDay" WHERE date >= (now() AT TIME ZONE 'Europe/Paris')::date - 29
      `),
      this.database.query<{ category: string; action: string; uses: number; failures: number; failureRate: number | null }>(`
        SELECT category, action, SUM(uses)::int AS uses, SUM(failures)::int AS failures,
          CASE WHEN SUM(uses) > 0 THEN SUM(failures)::float / SUM(uses) END AS "failureRate"
        FROM "FeatureUsageDay" WHERE date >= (now() AT TIME ZONE 'Europe/Paris')::date - 29
        GROUP BY category, action ORDER BY uses DESC LIMIT 25
      `),
      this.database.query<{ sport: string; type: string; name: string; subscriptions: number }>(`
        SELECT sport::text, type::text, name, COUNT(*)::int AS subscriptions FROM "Subscription"
        GROUP BY sport, type, name ORDER BY subscriptions DESC, name LIMIT 25
      `),
      this.database.query<{ taskName: string; runs: number; failures: number; averageDurationMs: number | null; maxDurationMs: number }>(`
        SELECT "taskName", SUM(runs)::int AS runs, SUM(failures)::int AS failures,
          CASE WHEN SUM(runs) > 0 THEN SUM("totalDurationMs")::float / SUM(runs) END AS "averageDurationMs",
          MAX("maxDurationMs")::int AS "maxDurationMs" FROM "TaskMetricHour"
        WHERE hour >= now() - interval '30 days' GROUP BY "taskName" ORDER BY runs DESC LIMIT 50
      `),
      this.database.query<{
        provider: string
        operation: string
        requests: number
        failures: number
        rateLimits: number
        averageDurationMs: number | null
        maxDurationMs: number
      }>(`
        SELECT provider, operation, SUM(requests)::int AS requests, SUM(failures)::int AS failures,
          SUM("rateLimits")::int AS "rateLimits", CASE WHEN SUM(requests) > 0 THEN SUM("totalDurationMs")::float / SUM(requests) END AS "averageDurationMs",
          MAX("maxDurationMs")::int AS "maxDurationMs" FROM "ApiMetricHour"
        WHERE hour >= now() - interval '30 days' GROUP BY provider, operation ORDER BY requests DESC LIMIT 50
      `),
      this.database.query<{ status: string; count: number }>(`
        SELECT status::text, COUNT(*)::int AS count FROM "BetMessage" GROUP BY status ORDER BY status
      `),
      this.database.query<{ count: number }>(`
        WITH ordered AS (
          SELECT transaction.*, LAG("balanceAfter") OVER (PARTITION BY "userId", "seasonId" ORDER BY "occurredAt", id) AS previous
          FROM "BalanceTransaction" transaction
        ) SELECT COUNT(*)::int AS count FROM ordered
        WHERE (previous IS NOT NULL AND previous + amount <> "balanceAfter")
          OR (previous IS NULL AND type = 'SEASON_OPENING' AND amount <> "balanceAfter")
      `),
      this.database.query<{
        id: string
        name: string
        isActive: boolean
        memberCount: number
        installedAt: string
        removedAt: string | null
        lastSyncedAt: string | null
        participants: number
      }>(`
        SELECT g.id, g.name, g."isActive", g."memberCount", g."installedAt", g."removedAt", g."lastSyncedAt",
          COUNT(DISTINCT sa."userId") FILTER (WHERE sa."participatedAt" IS NOT NULL)::int AS participants
        FROM "Guild" g LEFT JOIN "GuildUser" gu ON gu."guildId" = g.id LEFT JOIN "SeasonAccount" sa ON sa."userId" = gu.id
        GROUP BY g.id ORDER BY g."isActive" DESC, g."memberCount" DESC LIMIT 100
      `),
      this.database.query<{ date: string; installed: number; removed: number }>(`
        SELECT to_char(("occurredAt" AT TIME ZONE 'Europe/Paris')::date, 'YYYY-MM-DD') AS date,
          COUNT(*) FILTER (WHERE type = 'INSTALLED')::int AS installed,
          COUNT(*) FILTER (WHERE type = 'REMOVED')::int AS removed
        FROM "GuildLifecycleEvent" WHERE "occurredAt" >= now() - interval '90 days'
        GROUP BY 1 ORDER BY 1 LIMIT 90
      `),
      this.database.query<{
        id: number
        userId: number
        seasonId: number
        occurredAt: string
        amount: number
        previousBalance: number
        balanceAfter: number
      }>(`
        WITH ordered AS (
          SELECT transaction.*, LAG("balanceAfter") OVER (PARTITION BY "userId", "seasonId" ORDER BY "occurredAt", id) AS previous
          FROM "BalanceTransaction" transaction
        ) SELECT id, "userId", "seasonId", "occurredAt", amount, previous AS "previousBalance", "balanceAfter"
        FROM ordered WHERE (previous IS NOT NULL AND previous + amount <> "balanceAfter")
          OR (previous IS NULL AND type = 'SEASON_OPENING' AND amount <> "balanceAfter")
        ORDER BY "occurredAt" DESC, id DESC LIMIT 25
      `),
      this.database.query<{ type: string; net: number; volume: number; entries: number }>(`
        SELECT type::text, SUM(amount)::int AS net, SUM(ABS(amount))::int AS volume, COUNT(*)::int AS entries
        FROM "BalanceTransaction" WHERE "occurredAt" >= now() - interval '30 days'
        GROUP BY type ORDER BY volume DESC LIMIT 25
      `),
    ])
    return {
      guilds: guilds[0],
      operations: operations[0],
      corrections,
      activity: activity[0],
      features,
      subscriptions,
      tasks,
      providers,
      messages,
      anomalyCount: anomalyCount[0]?.count ?? 0,
      guildRows,
      lifecycle,
      anomalies,
      ledgerFlows,
    }
  }
}
