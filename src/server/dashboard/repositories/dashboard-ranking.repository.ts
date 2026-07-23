import type { BotDatabaseService } from '@/server/dashboard/database/bot-database.service'

interface LeaderboardRow {
  discordId: string
  username: string | null
  globalName: string | null
  avatarHash: string | null
  value: number | null
  rank: number | null
  settled: number
  isViewer: boolean
}

export class DashboardRankingRepository {
  constructor(private readonly database: BotDatabaseService) {}

  getLeaderboard(guildId: string, seasonId: number, metric: string, viewerDiscordId: string) {
    const expressions: Record<string, string> = {
      balance: 'balance',
      profit: 'profit',
      wins: 'wins',
      winRate: 'CASE WHEN settled >= 10 THEN wins::float / settled END',
      roi: 'CASE WHEN settled >= 10 AND staked > 0 THEN profit::float / staked END',
    }
    const expression = expressions[metric] ?? expressions.balance
    return this.database.query<LeaderboardRow>(
      `
      WITH eligible AS (
        SELECT gu."discordId", du.username, du."globalName", du."avatarHash", sa.balance,
          COALESCE(active.stake, 0)::int AS "activeStake",
          COALESCE(stats.wins, 0)::int AS wins, COALESCE(stats.settled, 0)::int AS settled,
          COALESCE(stats.profit, 0)::int AS profit, COALESCE(stats.staked, 0)::int AS staked
        FROM "SeasonAccount" sa
        JOIN "GuildUser" gu ON gu.id = sa."userId"
        JOIN "DiscordUser" du ON du."discordId" = gu."discordId"
        LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(stake), 0) AS stake FROM (
            SELECT b.stake FROM "Bet" b WHERE b."userId" = sa."userId" AND b."seasonId" = sa."seasonId"
            UNION ALL SELECT p.stake FROM "Parlay" p WHERE p."userId" = sa."userId" AND p."seasonId" = sa."seasonId"
          ) pending
        ) active ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(*) FILTER (WHERE h.outcome = 'WON') AS wins,
            COUNT(*) FILTER (WHERE h.outcome IN ('WON', 'LOST')) AS settled,
            COALESCE(SUM(h.payout - h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0) AS profit,
            COALESCE(SUM(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0) AS staked
          FROM "BetHistoryEntry" h WHERE h."userId" = sa."userId" AND h."seasonId" = sa."seasonId"
        ) stats ON true
        WHERE gu."guildId" = $1 AND sa."seasonId" = $2 AND sa."participatedAt" IS NOT NULL
          AND gu."isBanned" = false AND gu."leftAt" IS NULL AND du."isBot" = false
      ), ranked AS (
        SELECT *, ${expression} AS value,
          CASE WHEN ${expression} IS NOT NULL THEN RANK() OVER (ORDER BY ${expression} DESC NULLS LAST) END::int AS rank
        FROM eligible
      ), visible AS (
        SELECT * FROM ranked WHERE rank <= 50 OR "discordId" = $3
      )
      SELECT "discordId", username, "globalName", "avatarHash", value::float, rank, settled,
        ("discordId" = $3) AS "isViewer"
      FROM visible ORDER BY rank NULLS LAST, lower(COALESCE("globalName", username)), "discordId"
      LIMIT 51
    `,
      [guildId, seasonId, viewerDiscordId],
    )
  }

  async getBalanceRankSevenDaysAgo(guildId: string, seasonId: number, viewerDiscordId: string) {
    const [row] = await this.database.query<{ rank: number | null }>(
      `
      WITH cutoff AS (SELECT now() - interval '7 days' AS value), historical AS (
        SELECT gu."discordId",
          sa.balance - COALESCE((SELECT SUM(transaction.amount) FROM "BalanceTransaction" transaction, cutoff WHERE transaction."userId" = sa."userId" AND transaction."seasonId" = sa."seasonId" AND transaction."occurredAt" > cutoff.value), 0)
          + COALESCE((SELECT SUM(h.stake) FROM "BetHistoryEntry" h, cutoff WHERE h."userId" = sa."userId" AND h."seasonId" = sa."seasonId" AND h."placedAt" <= cutoff.value AND (h."settledAt" IS NULL OR h."settledAt" > cutoff.value)), 0) AS value
        FROM "SeasonAccount" sa JOIN "GuildUser" gu ON gu.id = sa."userId" JOIN "DiscordUser" du ON du."discordId" = gu."discordId", cutoff
        WHERE gu."guildId" = $1 AND sa."seasonId" = $2 AND sa."participatedAt" <= cutoff.value
          AND gu."isBanned" = false AND gu."leftAt" IS NULL AND du."isBot" = false
      ), ranked AS (SELECT "discordId", RANK() OVER (ORDER BY value DESC)::int AS rank FROM historical)
      SELECT rank FROM ranked WHERE "discordId" = $3
    `,
      [guildId, seasonId, viewerDiscordId],
    )
    return row?.rank ?? null
  }

  getAllTimeLeaderboard(guildId: string, metric: string, viewerDiscordId: string) {
    const expressions: Record<string, string> = {
      profit: 'profit',
      wins: 'wins',
      winRate: 'CASE WHEN settled >= 10 THEN wins::float / settled END',
      roi: 'CASE WHEN settled >= 10 AND staked > 0 THEN profit::float / staked END',
    }
    const expression = expressions[metric] ?? expressions.profit
    return this.database.query<LeaderboardRow>(
      `
      WITH eligible AS (
        SELECT gu."discordId", du.username, du."globalName", du."avatarHash",
          COUNT(*) FILTER (WHERE h.outcome = 'WON')::int AS wins,
          COUNT(*) FILTER (WHERE h.outcome IN ('WON', 'LOST'))::int AS settled,
          COALESCE(SUM(h.payout - h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS profit,
          COALESCE(SUM(h.stake) FILTER (WHERE h.outcome IN ('WON', 'LOST')), 0)::int AS staked
        FROM "GuildUser" gu JOIN "DiscordUser" du ON du."discordId" = gu."discordId"
        JOIN "SeasonAccount" sa ON sa."userId" = gu.id AND sa."participatedAt" IS NOT NULL
        LEFT JOIN "BetHistoryEntry" h ON h."userId" = gu.id
        WHERE gu."guildId" = $1 AND gu."isBanned" = false AND gu."leftAt" IS NULL AND du."isBot" = false
        GROUP BY gu.id, gu."discordId", du.username, du."globalName", du."avatarHash"
      ), ranked AS (
        SELECT *, ${expression} AS value,
          CASE WHEN ${expression} IS NOT NULL THEN RANK() OVER (ORDER BY ${expression} DESC NULLS LAST) END::int AS rank
        FROM eligible
      )
      SELECT "discordId", username, "globalName", "avatarHash", value::float, rank, settled,
        ("discordId" = $2) AS "isViewer" FROM ranked
      WHERE rank <= 50 OR "discordId" = $2
      ORDER BY rank NULLS LAST, lower(COALESCE("globalName", username)), "discordId" LIMIT 51
    `,
      [guildId, viewerDiscordId],
    )
  }

  getStreakLeaderboard(guildId: string, seasonId: number | null, metric: 'currentStreak' | 'longestStreak', viewerDiscordId: string) {
    const value =
      metric === 'longestStreak'
        ? 'COALESCE(longest.length, 0)'
        : `CASE WHEN latest.outcome = 'WON' THEN COALESCE(latest.length, 0) ELSE 0 END`
    return this.database.query<LeaderboardRow>(
      `
      WITH settled AS (
        SELECT h."userId", h."seasonId", h.outcome, h."settledAt", h.id,
          ROW_NUMBER() OVER (PARTITION BY h."userId", h."seasonId" ORDER BY h."settledAt", h.id)
          - ROW_NUMBER() OVER (PARTITION BY h."userId", h."seasonId", h.outcome ORDER BY h."settledAt", h.id) AS group_id
        FROM "BetHistoryEntry" h WHERE h.outcome IN ('WON', 'LOST') AND ($2::int IS NULL OR h."seasonId" = $2)
      ), runs AS (
        SELECT "userId", "seasonId", outcome, group_id, COUNT(*)::int AS length, MAX("settledAt") AS ended_at
        FROM settled GROUP BY "userId", "seasonId", outcome, group_id
      ), longest AS (
        SELECT "userId", MAX(length)::int AS length FROM runs WHERE outcome = 'WON' GROUP BY "userId"
      ), latest AS (
        SELECT DISTINCT ON ("userId") "userId", outcome, length FROM runs ORDER BY "userId", ended_at DESC
      ), eligible AS (
        SELECT DISTINCT gu.id, gu."discordId", du.username, du."globalName", du."avatarHash",
          (SELECT COUNT(*)::int FROM settled WHERE settled."userId" = gu.id) AS settled
        FROM "GuildUser" gu JOIN "DiscordUser" du ON du."discordId" = gu."discordId"
        JOIN "SeasonAccount" sa ON sa."userId" = gu.id AND sa."participatedAt" IS NOT NULL AND ($2::int IS NULL OR sa."seasonId" = $2)
        WHERE gu."guildId" = $1 AND gu."isBanned" = false AND gu."leftAt" IS NULL AND du."isBot" = false
      ), ranked AS (
        SELECT eligible.*, ${value} AS value, RANK() OVER (ORDER BY ${value} DESC)::int AS rank
        FROM eligible LEFT JOIN longest ON longest."userId" = eligible.id LEFT JOIN latest ON latest."userId" = eligible.id
      )
      SELECT "discordId", username, "globalName", "avatarHash", value, rank, settled, ("discordId" = $3) AS "isViewer"
      FROM ranked WHERE rank <= 50 OR "discordId" = $3 ORDER BY rank, lower(COALESCE("globalName", username)), "discordId" LIMIT 51
    `,
      [guildId, seasonId, viewerDiscordId],
    )
  }
}
