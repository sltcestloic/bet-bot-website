import type { DashboardFilters } from '@/server/dashboard/repositories/dashboard.repository'

export interface TicketQueryOptions {
  filters: DashboardFilters
  limit?: number
  cursor?: number
}

export function buildTicketQuery(discordId: string, guildId: string, seasonId: number | null, options: TicketQueryOptions) {
  const { filters, cursor, limit = 25 } = options
  const values: unknown[] = [discordId, guildId, seasonId]
  const conditions = ['gu."discordId" = $1', 'gu."guildId" = $2', '($3::int IS NULL OR h."seasonId" = $3)']
  const addCondition = createConditionAppender(values, conditions)

  addOptionalFilters(addCondition, filters, cursor)
  const legConditions = buildLegConditions(values, filters)
  if (legConditions.length) {
    conditions.push(
      `EXISTS (SELECT 1 FROM "BetHistoryLeg" filtered_leg WHERE filtered_leg."historyEntryId" = h.id AND ${legConditions.join(' AND ')})`,
    )
  }
  values.push(limit + 1)
  return { conditions, values }
}

function addOptionalFilters(add: (sql: string, value: unknown) => void, filters: DashboardFilters, cursor: number | undefined) {
  const optionalFilters: [unknown, string][] = [
    [filters.from, 'h."placedAt" >= (?::date AT TIME ZONE \'Europe/Paris\')'],
    [filters.to, 'h."placedAt" < ((?::date + 1) AT TIME ZONE \'Europe/Paris\')'],
    [filters.kind, 'h.kind::text = ?'],
    [filters.outcome, 'h.outcome::text = ?'],
    [filters.outcomes?.length ? filters.outcomes : undefined, 'h.outcome::text = ANY(?::text[])'],
    [cursor, 'h.id < ?'],
  ]
  optionalFilters.forEach(([value, sql]) => {
    if (value !== undefined) add(sql, value)
  })
}

function buildLegConditions(values: unknown[], filters: DashboardFilters) {
  const conditions: string[] = []
  const add = createConditionAppender(values, conditions)
  const optionalFilters: [unknown, string][] = [
    [filters.sport, 'filtered_leg.sport::text = ?'],
    [filters.competition, 'filtered_leg.competition = ?'],
    [filters.team, '(filtered_leg.team1 = ? OR filtered_leg.team2 = ?)'],
    [filters.phase, 'filtered_leg."placementPhase"::text = ?'],
  ]
  optionalFilters.forEach(([value, sql]) => {
    if (value !== undefined) add(sql, value)
  })
  return conditions
}

function createConditionAppender(values: unknown[], conditions: string[]) {
  return (sql: string, value: unknown) => {
    values.push(value)
    const parameter = `$${values.length}`
    conditions.push(sql.replaceAll('?', parameter))
  }
}
