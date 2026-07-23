import { Flame, Medal, TrendingUp } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { AchievementCelebration } from '@/client/features/dashboard/components/achievement-celebration'
import { ProfitChart } from '@/client/features/dashboard/components/dashboard-charts'
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
import type { CachedResponse, DashboardSeason, OverviewData } from '@/client/features/dashboard/types/dashboard-types'
import { formatCoins, formatOdds, formatPercent } from '@/client/features/dashboard/utils/dashboard-formatters'

export function OverviewPage() {
  const { guildId } = useParams()
  const { search } = useLocation()
  const state = useDashboardData<CachedResponse<OverviewData>>(`/guilds/${guildId}/overview${search}`)
  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Vue d’ensemble" description="Votre saison en un regard." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Vue d’ensemble" description="Votre saison en un regard." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  return <OverviewContent response={state.data} guildId={guildId} refresh={state.refresh} />
}

function OverviewContent({
  response,
  guildId,
  refresh,
}: {
  response: CachedResponse<OverviewData>
  guildId?: string
  refresh: () => void
}) {
  const { data, generatedAt, stale } = response
  const hasPerformance = data.metrics.settled > 0
  return (
    <PageFrame>
      {data.celebration && guildId && <AchievementCelebration guildId={guildId} achievement={data.celebration} />}
      <PageHeader
        title="Vue d’ensemble"
        description="Votre position, votre forme et vos derniers tickets."
        generatedAt={generatedAt}
        stale={stale}
        onRefresh={refresh}
      />
      <SeasonFilter seasons={data.seasons} selected={data.season} />
      {!data.account?.participatedAt ? (
        <div className="mt-6">
          <EmptyState
            title="Vous ne participez pas encore à cette saison"
            description="Vos statistiques apparaîtront après votre première interaction avec Bet Bot."
          />
        </div>
      ) : (
        <>
          {data.account.isBanned && (
            <p className="mt-5 rounded-md border border-[#f4c25b]/25 bg-[#f4c25b]/8 px-4 py-3 text-sm font-bold text-[#f4d58e]">
              Non éligible aux classements
            </p>
          )}
          {data.season && <SeasonProgress season={data.season} now={new Date(generatedAt).getTime()} />}
          <HeadlineMetrics data={data} />
          <PerformanceSummary data={data} />
          {hasPerformance && <PersonalRecords data={data} />}
          <RecentTickets data={data} />
          <PersonalActivity data={data} />
        </>
      )}
    </PageFrame>
  )
}

function HeadlineMetrics({ data }: { data: OverviewData }) {
  return (
    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6" aria-label="Statistiques principales">
      <MetricCard label="Solde disponible" value={formatCoins(data.account?.balance ?? 0)} />
      <MetricCard label="Mises actives" value={formatCoins(data.account?.activeStake ?? 0)} detail="Tickets en attente" />
      <MetricCard
        label="Classement"
        value={data.rank?.rank ? `#${data.rank.rank}` : 'Non classé'}
        tone="gold"
        detail={getRankDetail(data.rank?.rank ?? null, data.previousRank)}
      />
      <MetricCard
        label="Profit réalisé"
        value={formatCoins(data.metrics.realizedProfit)}
        tone={data.metrics.realizedProfit >= 0 ? 'positive' : 'negative'}
      />
      <MetricCard label="ROI" value={formatPercent(data.metrics.roi)} tone={(data.metrics.roi ?? 0) >= 0 ? 'positive' : 'negative'} />
      <MetricCard
        label="Winrate"
        value={formatPercent(data.metrics.winRate)}
        detail={`${data.metrics.wins} gagnés · ${data.metrics.losses} perdus`}
      />
    </section>
  )
}

function PerformanceSummary({ data }: { data: OverviewData }) {
  return (
    <section className="mt-7 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black">Profit cumulé</h2>
            <p className="mt-1 text-xs text-[#777f91]">Tickets réglés uniquement</p>
          </div>
          <TrendingUp className="size-5 text-[#7e88ff]" />
        </div>
        {data.trend.length ? <ProfitChart data={data.trend} /> : <EmptyState />}
      </div>
      <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-5">
        <h2 className="font-black">Forme récente</h2>
        <RecentForm outcomes={data.recentForm} />
        <div className="mt-7 grid grid-cols-2 gap-3">
          <StreakValue icon={Flame} value={data.streaks.current?.length ?? 0} label="Série actuelle" />
          <StreakValue icon={Medal} value={data.streaks.longestWinning} label="Record gagnant" />
        </div>
      </div>
    </section>
  )
}

function RecentForm({ outcomes }: { outcomes: OverviewData['recentForm'] }) {
  if (!outcomes.length) return <p className="mt-5 text-sm text-[#777f91]">Aucune donnée sur cette période</p>
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {outcomes.map((outcome, index) => (
        <span
          key={index}
          className={`flex size-8 items-center justify-center rounded text-xs font-black ${outcome === 'WON' ? 'bg-[#3aba85]/15 text-[#62d5a2]' : 'bg-[#f07468]/15 text-[#f49a90]'}`}
        >
          {outcome === 'WON' ? 'V' : 'D'}
        </span>
      ))}
    </div>
  )
}

function StreakValue({ icon: Icon, value, label }: { icon: typeof Flame; value: number; label: string }) {
  return (
    <div>
      <Icon className="size-5 text-[#f4c25b]" />
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="text-xs text-[#777f91]">{label}</p>
    </div>
  )
}

function PersonalRecords({ data }: { data: OverviewData }) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-black">Records personnels</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Plus gros gain net" value={formatCoins(data.metrics.largestNetWin ?? 0)} tone="gold" />
        <MetricCard label="Plus haute cote gagnante" value={formatOdds(data.metrics.highestWinningOdds)} tone="gold" />
        <MetricCard label="Plus longue série gagnante" value={`${data.streaks.longestWinning} victoire(s)`} tone="gold" />
      </div>
    </section>
  )
}

function RecentTickets({ data }: { data: OverviewData }) {
  return (
    <section className="mt-7 rounded-md border border-white/[0.08] bg-[#181b23] px-4 sm:px-5">
      <div className="flex items-center justify-between border-b border-white/[0.07] py-4">
        <h2 className="font-black">Tickets récents</h2>
        <Link to="../history" className="text-xs font-bold text-[#9ea6ff] hover:text-white">
          Tout voir
        </Link>
      </div>
      {data.recentTickets.length ? <TicketList tickets={data.recentTickets} /> : <EmptyState />}
    </section>
  )
}

function PersonalActivity({ data }: { data: OverviewData }) {
  return (
    <section className="mt-7 border-y border-white/[0.08] py-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black">Activité personnelle</h2>
          <p className="mt-1 text-xs text-[#777f91]">30 derniers jours · données proches du temps réel</p>
        </div>
        <Link to="../activity" className="text-xs font-bold text-[#9ea6ff]">
          Voir l’activité
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <ActivityValue value={data.activity.activeDays} label="Jours actifs" />
        <ActivityValue value={data.activity.betsPlaced} label="Tickets" />
        <ActivityValue value={data.activity.dailyClaims} label="Récompenses" />
      </div>
    </section>
  )
}

function ActivityValue({ value, label }: { value: number; label: string }) {
  return (
    <p>
      <strong className="block text-lg">{value}</strong>
      <span className="text-[#777f91]">{label}</span>
    </p>
  )
}

function getRankDetail(rank: number | null, previousRank: number | null) {
  if (!rank) return 'Selon le solde disponible'
  if (!previousRank) return 'Nouveau au classement'
  const movement = previousRank - rank
  return `${movement > 0 ? '+' : ''}${movement} place(s) sur 7 jours`
}

function SeasonProgress({ season, now }: { season: DashboardSeason; now: number }) {
  const start = new Date(season.startsAt).getTime()
  const close = season.bettingClosesAt ? new Date(season.bettingClosesAt).getTime() : null
  const progress = close && close > start ? Math.max(0, Math.min(100, ((now - start) / (close - start)) * 100)) : null
  return (
    <section className="mt-5 rounded-md border border-white/[0.08] bg-[#181b23] p-4">
      <div className="flex items-center justify-between text-xs font-bold">
        <span>
          Saison {season.number} · {season.status === 'CLOSING' ? 'Clôture en cours' : 'En cours'}
        </span>
        <span className="text-[#9298a8]">
          {progress === null
            ? `Commencée le ${new Date(season.startsAt).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}`
            : `${Math.round(progress)} % écoulée`}
        </span>
      </div>
      {progress !== null && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-[#5865f2]" style={{ width: `${progress}%` }} />
        </div>
      )}
    </section>
  )
}
