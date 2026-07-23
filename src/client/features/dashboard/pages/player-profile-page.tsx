import { useLocation, useParams } from 'react-router-dom'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageFrame,
  PageHeader,
  SeasonFilter,
} from '@/client/features/dashboard/components/dashboard-ui'
import { TicketList } from '@/client/features/dashboard/components/ticket-list'
import { useDashboardData } from '@/client/features/dashboard/hooks/use-dashboard-data'
import type { OverviewData } from '@/client/features/dashboard/types/dashboard-types'
import { formatCoins, formatPercent } from '@/client/features/dashboard/utils/dashboard-formatters'

type PublicMetric = OverviewData['metrics']
interface Category {
  name?: string
  sport?: string
  selections: number
  wins: number
  losses: number
  winRate: number | null
}
interface PlayerData {
  profile: { displayName: string; username: string | null; avatarUrl: string } | null
  overview: OverviewData
  performance: { singles: PublicMetric; parlays: PublicMetric; sports: Category[]; competitions: Category[]; teams: Category[] }
}

export function PlayerProfilePage() {
  const { guildId, discordId } = useParams()
  const { search } = useLocation()
  const state = useDashboardData<PlayerData>(`/guilds/${guildId}/players/${discordId}${search}`)
  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Profil joueur" description="Performances publiques dans ce serveur." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Profil joueur" description="Performances publiques dans ce serveur." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  const data = state.data.overview
  return (
    <PageFrame>
      <div className="mb-5 flex items-center gap-4">
        <img src={state.data.profile?.avatarUrl} alt="" className="size-14 rounded-full bg-[#252935]" />
        <div>
          <h1 className="text-xl font-black">{state.data.profile?.displayName ?? 'Profil joueur'}</h1>
          {state.data.profile?.username && <p className="text-sm text-[#777f91]">@{state.data.profile.username}</p>}
        </div>
      </div>
      <PageHeader title="Performances publiques" description="Données limitées au serveur sélectionné." />
      <SeasonFilter seasons={data.seasons} selected={data.season} />
      {data.metrics.placed === 0 ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Profit réalisé"
              value={formatCoins(data.metrics.realizedProfit)}
              tone={data.metrics.realizedProfit >= 0 ? 'positive' : 'negative'}
            />
            <MetricCard label="Winrate" value={formatPercent(data.metrics.winRate)} />
            <MetricCard label="Victoires" value={data.metrics.wins} />
            <MetricCard label="Plus longue série" value={data.streaks.longestWinning} tone="gold" />
          </section>
          <section className="mt-7 grid gap-4 sm:grid-cols-2">
            <MetricBreakdown title="Paris simples" metrics={state.data.performance.singles} />
            <MetricBreakdown title="Combinés" metrics={state.data.performance.parlays} />
          </section>
          <section className="mt-7 grid gap-4 xl:grid-cols-3">
            <CategoryList title="Sports" rows={state.data.performance.sports} />
            <CategoryList title="Compétitions" rows={state.data.performance.competitions} />
            <CategoryList title="Équipes" rows={state.data.performance.teams} />
          </section>
          <section className="mt-7 rounded-md border border-white/[0.08] bg-[#181b23] px-4">
            <h2 className="border-b border-white/[0.07] py-4 font-black">Tickets récents</h2>
            <TicketList tickets={data.recentTickets} />
          </section>
        </>
      )}
    </PageFrame>
  )
}

function MetricBreakdown({ title, metrics }: { title: string; metrics: PublicMetric }) {
  return (
    <section className="rounded-md border border-white/[0.08] bg-[#181b23] p-4">
      <h2 className="font-black">{title}</h2>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <p>
          <strong className="block text-lg">{metrics.settled}</strong>
          <span className="text-xs text-[#777f91]">Réglés</span>
        </p>
        <p>
          <strong className="block text-lg">{formatPercent(metrics.winRate)}</strong>
          <span className="text-xs text-[#777f91]">Winrate</span>
        </p>
        <p>
          <strong className={metrics.realizedProfit >= 0 ? 'block text-lg text-[#5fd3a0]' : 'block text-lg text-[#f28a7f]'}>
            {formatCoins(metrics.realizedProfit)}
          </strong>
          <span className="text-xs text-[#777f91]">Profit</span>
        </p>
      </div>
    </section>
  )
}

function CategoryList({ title, rows }: { title: string; rows: Category[] }) {
  return (
    <section className="rounded-md border border-white/[0.08] bg-[#181b23]">
      <h2 className="border-b border-white/[0.07] px-4 py-4 font-black">{title}</h2>
      {rows.length ? (
        <div className="divide-y divide-white/[0.06]">
          {rows.slice(0, 8).map(row => (
            <div key={row.name ?? row.sport} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 truncate font-bold">{row.name ?? row.sport}</span>
              <span className="shrink-0 text-xs text-[#9299aa]">
                {row.wins + row.losses} sélections · {formatPercent(row.winRate)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}
