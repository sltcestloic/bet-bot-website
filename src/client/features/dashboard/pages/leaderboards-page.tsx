import { Medal } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageFrame,
  PageHeader,
  SeasonFilter,
} from '@/client/features/dashboard/components/dashboard-ui'
import { useDashboardData } from '@/client/features/dashboard/hooks/use-dashboard-data'
import type { DashboardSeason } from '@/client/features/dashboard/types/dashboard-types'
import { formatCoins, formatInteger, formatPercent } from '@/client/features/dashboard/utils/dashboard-formatters'

interface Row {
  discordId: string
  username: string | null
  globalName: string | null
  value: number | null
  rank: number | null
  settled: number
  isViewer: boolean
}
interface LeaderboardsData {
  season: DashboardSeason | null
  seasons: DashboardSeason[]
  boards: Record<string, Row[]>
}
const seasonBoards = [
  { metric: 'balance', title: 'Solde disponible' },
  { metric: 'profit', title: 'Profit réalisé' },
  { metric: 'wins', title: 'Victoires' },
  { metric: 'winRate', title: 'Winrate' },
  { metric: 'roi', title: 'ROI' },
  { metric: 'currentStreak', title: 'Série gagnante actuelle' },
  { metric: 'longestStreak', title: 'Plus longue série gagnante' },
]
const allTimeBoards = seasonBoards.filter(board => !['balance', 'currentStreak'].includes(board.metric))

export function LeaderboardsPage() {
  const { guildId } = useParams()
  const { search } = useLocation()
  const state = useDashboardData<LeaderboardsData>(`/guilds/${guildId}/leaderboards${search}`)
  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Classements" description="Mesurez-vous aux membres du serveur." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Classements" description="Mesurez-vous aux membres du serveur." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  const data = state.data
  const visibleBoards = data.season ? seasonBoards : allTimeBoards
  return (
    <PageFrame>
      <PageHeader
        title="Classements"
        description="Joueurs actifs et éligibles uniquement. Le classement de solde utilise le solde disponible."
      />
      <SeasonFilter seasons={data.seasons} selected={data.season} />
      {!data.season && <p className="mt-4 text-xs text-[#858c9d]">Les soldes de saisons distinctes ne sont jamais additionnés.</p>}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {visibleBoards.map(board => (
          <Board key={board.metric} {...board} rows={data.boards[board.metric] ?? []} guildId={guildId ?? ''} />
        ))}
      </div>
    </PageFrame>
  )
}

function Board({ title, metric, rows, guildId }: { title: string; metric: string; rows: Row[]; guildId: string }) {
  const isRate = metric === 'winRate' || metric === 'roi'
  return (
    <section className="rounded-md border border-white/[0.08] bg-[#181b23]">
      <div className="border-b border-white/[0.07] px-4 py-4">
        <h2 className="font-black">{title}</h2>
        {isRate && <p className="mt-1 text-xs text-[#777f91]">Minimum 10 tickets réglés</p>}
      </div>
      {rows.length ? (
        <div className="divide-y divide-white/[0.06]">
          {rows.map(row => (
            <Link
              key={row.discordId}
              to={`/dashboard/${guildId}/players/${row.discordId}`}
              className={`grid grid-cols-[36px_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03] ${row.isViewer ? 'bg-[#5865f2]/8' : ''}`}
            >
              <RankPosition rank={row.rank} />
              <span className="min-w-0">
                <strong className="block truncate text-sm">{row.globalName ?? row.username ?? 'Utilisateur Discord'}</strong>
                {isRate && row.settled < 10 && (
                  <span className="text-[11px] text-[#777f91]">Non classé · {row.settled}/10 tickets réglés</span>
                )}
              </span>
              <strong className="text-sm">{formatValue(metric, row.value)}</strong>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}

function RankPosition({ rank }: { rank: number | null }) {
  if (!rank) return <span className="font-black text-[#f4c25b]">—</span>
  if (rank <= 3) return <Medal className="size-5 text-[#f4c25b]" aria-label={`Rang ${rank}`} />
  return <span className="font-black text-[#f4c25b]">#{rank}</span>
}

function formatValue(metric: string, value: number | null) {
  if (value === null) return 'Non classé'
  if (metric === 'balance' || metric === 'profit') return formatCoins(value)
  if (metric === 'winRate' || metric === 'roi') return formatPercent(value)
  return formatInteger(value)
}
