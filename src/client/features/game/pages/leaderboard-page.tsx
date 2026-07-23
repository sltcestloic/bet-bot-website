import { Crown, Medal } from 'lucide-react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'

import { GameSeasonSelect, SegmentedFilter } from '@/client/features/game/components/game-filters'
import { GameEmpty, GameError, GameFrame, GameLoading, GamePageHeader, GamePanel } from '@/client/features/game/components/game-ui'
import { useGameData } from '@/client/features/game/hooks/use-game-data'
import type { GameSeason, LeaderboardRow } from '@/client/features/game/types/game-types'
import { getDiscordAvatarUrl } from '@/client/features/game/utils/discord-avatar'
import { formatCoins, formatInteger, formatPercent } from '@/client/features/game/utils/game-formatters'

interface Data {
  season: GameSeason | null
  seasons: GameSeason[]
  boards: Record<string, LeaderboardRow[]>
}
const metrics = [
  { value: 'balance', label: 'Solde' },
  { value: 'profit', label: 'Profit net' },
  { value: 'wins', label: 'Victoires' },
  { value: 'winRate', label: 'Winrate' },
  { value: 'currentStreak', label: 'Série actuelle' },
  { value: 'longestStreak', label: 'Meilleure série' },
]

export function LeaderboardPage() {
  const { guildId = '' } = useParams()
  const { search } = useLocation()
  const [params] = useSearchParams()
  const metric = params.get('metric') ?? 'balance'
  const state = useGameData<Data>(`/guilds/${guildId}/leaderboard${search}`)
  if (state.loading)
    return (
      <GameFrame>
        <GameLoading />
      </GameFrame>
    )
  if (state.error || !state.data)
    return (
      <GameFrame>
        <GameError retry={state.refresh} />
      </GameFrame>
    )
  return <LeaderboardContent data={state.data} guildId={guildId} metric={metric} />
}

function LeaderboardContent({ data, guildId, metric }: { data: Data; guildId: string; metric: string }) {
  const available = data.season ? metrics : metrics.filter(entry => ['profit', 'wins', 'winRate', 'longestStreak'].includes(entry.value))
  const selectedMetric = available.some(entry => entry.value === metric) ? metric : available[0].value
  const selectedMetricLabel = available.find(entry => entry.value === selectedMetric)?.label ?? 'Score'
  const rows = data.boards[selectedMetric] ?? []
  const podium = rows.slice(0, 3)
  const viewer = rows.find(row => row.isViewer)
  return (
    <GameFrame>
      <GamePageHeader eyebrow="Arène" title="Classement" />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-full overflow-x-auto">
          <SegmentedFilter name="metric" fallback={selectedMetric} options={available} />
        </div>
        <GameSeasonSelect seasons={data.seasons} selected={data.season} allowAll />
      </div>
      {selectedMetric === 'winRate' && <p className="mt-3 text-xs text-white/40">Minimum 10 tickets terminés pour être classé.</p>}
      {rows.length ? (
        <>
          <section className="podium mt-8 grid grid-cols-3 items-end gap-2 sm:gap-4">
            {[podium[1], podium[0], podium[2]].map((row, index) =>
              row ? (
                <Podium
                  key={row.discordId}
                  row={row}
                  place={[2, 1, 3][index]}
                  metric={selectedMetric}
                  metricLabel={selectedMetricLabel}
                  guildId={guildId}
                />
              ) : (
                <span key={index} />
              ),
            )}
          </section>
          <GamePanel className="mt-6 overflow-hidden">
            <div className="divide-y divide-white/[.06]">
              {rows.slice(3).map(row => (
                <PlayerRow key={row.discordId} row={row} metric={selectedMetric} guildId={guildId} />
              ))}
            </div>
          </GamePanel>
          {viewer && !rows.slice(0, 15).includes(viewer) && (
            <div className="sticky bottom-20 mt-4 lg:bottom-4">
              <GamePanel className="border-[#7d88ff]/35 p-1">
                <PlayerRow row={viewer} metric={selectedMetric} guildId={guildId} />
              </GamePanel>
            </div>
          )}
        </>
      ) : (
        <GameEmpty />
      )}
    </GameFrame>
  )
}

function Podium({
  row,
  place,
  metric,
  metricLabel,
  guildId,
}: {
  row: LeaderboardRow
  place: number
  metric: string
  metricLabel: string
  guildId: string
}) {
  const displayName = row.globalName ?? row.username ?? 'Joueur'
  return (
    <Link
      to={`/app/${guildId}/players/${row.discordId}`}
      className={`podium-step flex min-w-0 flex-col items-center rounded-t-xl border border-b-0 border-white/10 px-1 pt-5 pb-4 text-center sm:px-3 ${getPodiumClass(place)}`}
    >
      <span className="relative">
        {place === 1 ? (
          <Crown className="absolute -top-5 left-1/2 size-6 -translate-x-1/2 fill-[#f4c25b]/25 text-[#ffd875]" />
        ) : (
          <Medal className="absolute -top-4 left-1/2 size-5 -translate-x-1/2 text-white/55" />
        )}
        <img
          src={row.avatarUrl ?? getDiscordAvatarUrl(row.discordId, row.avatarHash)}
          alt=""
          className={`rounded-full object-cover shadow-xl ${getAvatarClass(place)}`}
        />
        <span
          className={`absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full text-xs font-black ${getRankBadgeClass(place)}`}
        >
          #{place}
        </span>
      </span>
      <strong className="mt-4 w-full truncate text-sm">{displayName}</strong>
      <strong className={`mt-4 w-full text-lg leading-tight font-black sm:text-xl ${getMetricClass(metric, row.value)}`}>
        {formatLeaderboardValue(metric, row.value)}
      </strong>
      <span className="mt-1 text-[10px] font-bold text-white/38 uppercase">{metricLabel}</span>
    </Link>
  )
}

function getPodiumClass(place: number) {
  if (place === 1) return 'h-72 bg-[#f4c25b]/12'
  if (place === 2) return 'h-64 bg-white/[.06]'
  return 'h-60 bg-[#f07468]/8'
}

function getAvatarClass(place: number) {
  if (place === 1) return 'size-20 border-4 border-[#f4c25b] sm:size-22'
  if (place === 2) return 'size-16 border-3 border-[#c3cad8] sm:size-18'
  return 'size-16 border-3 border-[#c77f69] sm:size-18'
}

function getRankBadgeClass(place: number) {
  if (place === 1) return 'bg-[#f4c25b] text-[#2b2110] ring-2 ring-[#332817]'
  if (place === 2) return 'bg-[#c3cad8] text-[#20232d] ring-2 ring-[#252936]'
  return 'bg-[#c77f69] text-[#281814] ring-2 ring-[#30201d]'
}

function getMetricClass(metric: string, value: number | null) {
  if (metric === 'profit') return (value ?? 0) >= 0 ? 'text-[#65dca7]' : 'text-[#f49589]'
  if (metric === 'balance' || metric.includes('Streak')) return 'text-[#ffe093]'
  return 'text-[#aab0ff]'
}
function PlayerRow({ row, metric, guildId }: { row: LeaderboardRow; metric: string; guildId: string }) {
  const unranked = metric === 'winRate' && row.settled < 10
  return (
    <Link
      to={`/app/${guildId}/players/${row.discordId}`}
      className={`grid grid-cols-[42px_1fr_auto] items-center gap-3 px-4 py-3.5 hover:bg-white/[.04] ${row.isViewer ? 'bg-[#5865f2]/10' : ''}`}
    >
      <strong className="text-sm text-[#f4c25b]">{unranked ? '—' : `#${row.rank}`}</strong>
      <span className="min-w-0">
        <strong className="block truncate text-sm">{row.globalName ?? row.username ?? 'Joueur'}</strong>
        {unranked && <span className="text-[10px] text-white/38">Non classé · {row.settled}/10 tickets terminés</span>}
      </span>
      <strong className="text-sm">{formatLeaderboardValue(metric, row.value)}</strong>
    </Link>
  )
}
function formatLeaderboardValue(metric: string, value: number | null) {
  if (value === null) return '—'
  if (metric === 'balance' || metric === 'profit') return formatCoins(value)
  if (metric === 'winRate') return formatPercent(value)
  return formatInteger(value)
}
