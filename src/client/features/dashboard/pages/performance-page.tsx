import { useLocation, useParams } from 'react-router-dom'

import { ProfitChart, VolumeChart } from '@/client/features/dashboard/components/dashboard-charts'
import { DashboardFilters } from '@/client/features/dashboard/components/dashboard-filters'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageFrame,
  PageHeader,
  SeasonFilter,
} from '@/client/features/dashboard/components/dashboard-ui'
import { useDashboardData } from '@/client/features/dashboard/hooks/use-dashboard-data'
import type { CachedResponse, DashboardSeason, MetricSummary } from '@/client/features/dashboard/types/dashboard-types'
import { formatCoins, formatOdds, formatPercent } from '@/client/features/dashboard/utils/dashboard-formatters'

interface BreakdownRow {
  bucket?: string
  label?: string
  phase?: string
  sport?: string
  settled: number
  wins?: number
  winRate?: number | null
  stake?: number
  profit?: number
  roi?: number | null
  minimum?: number
  maximum?: number | null
}
interface PerformanceData {
  season: DashboardSeason | null
  seasons: DashboardSeason[]
  metrics: MetricSummary
  singles: MetricSummary
  parlays: MetricSummary
  trend: { date: string; cumulativeProfit: number; stake: number; payout: number }[]
  recentForm: string[]
  comparison: MetricSummary | null
  breakdowns: {
    odds: BreakdownRow[]
    stakes: BreakdownRow[]
    weekdays: BreakdownRow[]
    hours: BreakdownRow[]
    phases: BreakdownRow[]
    sportFinance: BreakdownRow[]
  }
}

export function PerformancePage() {
  const { guildId } = useParams()
  const { search } = useLocation()
  const state = useDashboardData<CachedResponse<PerformanceData>>(`/guilds/${guildId}/performance${search}`)
  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Performances" description="Analyse détaillée de vos tickets réglés." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Performances" description="Analyse détaillée de vos tickets réglés." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  return <PerformanceContent response={state.data} refresh={state.refresh} />
}

function PerformanceContent({ response, refresh }: { response: CachedResponse<PerformanceData>; refresh: () => void }) {
  const { data } = response
  return (
    <PageFrame>
      <PageHeader
        title="Performances"
        description="Tickets, rendement, volume et comparaison entre simples et combinés."
        generatedAt={response.generatedAt}
        stale={response.stale}
        onRefresh={refresh}
      />
      <SeasonFilter seasons={data.seasons} selected={data.season} />
      <DashboardFilters />
      {data.metrics.settled === 0 ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <>
          <PerformanceMetrics metrics={data.metrics} />
          <section className="mt-7 grid gap-4 xl:grid-cols-2">
            <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-5">
              <h2 className="font-black">Profit réalisé cumulé</h2>
              <ProfitChart data={data.trend} />
            </div>
            <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-5">
              <h2 className="font-black">Mises et paiements</h2>
              <VolumeChart data={data.trend} />
            </div>
          </section>
          <section className="mt-7">
            <h2 className="text-lg font-black">Simples et combinés</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Comparison title="Tickets simples" metrics={data.singles} />
              <Comparison title="Combinés" metrics={data.parlays} />
            </div>
          </section>
          {data.comparison && data.comparison.settled > 0 && (
            <section className="mt-7 border-y border-white/[0.08] py-5">
              <h2 className="font-black">Comparaison avec la période précédente</h2>
              <p className="mt-1 text-xs text-[#777f91]">Période immédiatement précédente de même durée</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Delta label="Profit" current={data.metrics.realizedProfit} previous={data.comparison.realizedProfit} coins />
                <Delta label="Tickets réglés" current={data.metrics.settled} previous={data.comparison.settled} />
                <Delta label="Winrate" current={data.metrics.winRate} previous={data.comparison.winRate} percent />
                <Delta label="ROI" current={data.metrics.roi} previous={data.comparison.roi} percent />
              </div>
            </section>
          )}
          <section className="mt-7">
            <h2 className="text-lg font-black">Analyses détaillées</h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <AnalysisTable title="Performance par cote" rows={data.breakdowns.odds} label={row => row.bucket ?? ''} />
              <AnalysisTable
                title="Performance par mise"
                rows={data.breakdowns.stakes}
                label={row =>
                  row.maximum
                    ? `${row.bucket} · ${formatCoins(row.minimum ?? 0)}–${formatCoins(row.maximum)}`
                    : `${row.bucket} · ≥ ${formatCoins(row.minimum ?? 0)}`
                }
              />
              <AnalysisTable
                title="Avant-match et direct"
                rows={data.breakdowns.phases}
                label={row => (row.phase === 'LIVE' ? 'En direct' : 'Avant-match')}
              />
              <AnalysisTable
                title="Jour de placement"
                rows={data.breakdowns.weekdays}
                label={row => ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][Number(row.label)]}
              />
              <AnalysisTable title="Heure de placement" rows={data.breakdowns.hours} label={row => `${row.label} h`} />
              <AnalysisTable
                title="Finances par sport attribuable"
                rows={data.breakdowns.sportFinance}
                label={row => row.sport ?? ''}
                financial
              />
            </div>
          </section>
        </>
      )}
    </PageFrame>
  )
}

function PerformanceMetrics({ metrics }: { metrics: MetricSummary }) {
  return (
    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
      <MetricCard label="Tickets placés" value={metrics.placed} detail={`${metrics.pending} en attente · ${metrics.cancelled} annulés`} />
      <MetricCard label="Tickets réglés" value={metrics.settled} />
      <MetricCard label="Victoires / défaites" value={`${metrics.wins} / ${metrics.losses}`} />
      <MetricCard label="Winrate" value={formatPercent(metrics.winRate)} />
      <MetricCard
        label="Profit réalisé"
        value={formatCoins(metrics.realizedProfit)}
        tone={metrics.realizedProfit >= 0 ? 'positive' : 'negative'}
      />
      <MetricCard label="ROI" value={formatPercent(metrics.roi)} tone={(metrics.roi ?? 0) >= 0 ? 'positive' : 'negative'} />
      <MetricCard label="Cote moyenne" value={formatOdds(metrics.averageOdds)} />
      <MetricCard label="Mise moyenne" value={formatCoins(metrics.averageStake ?? 0)} />
      <MetricCard label="Plus grosse mise" value={formatCoins(metrics.largestStake ?? 0)} />
      <MetricCard label="Plus gros paiement" value={formatCoins(metrics.largestPayout ?? 0)} />
      <MetricCard label="Plus gros gain net" value={formatCoins(metrics.largestNetWin ?? 0)} tone="gold" />
      <MetricCard label="Meilleure cote gagnante" value={formatOdds(metrics.highestWinningOdds)} tone="gold" />
    </section>
  )
}

function Comparison({ title, metrics }: { title: string; metrics: MetricSummary }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-5">
      <h3 className="font-black">{title}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-[#777f91]">Winrate</dt>
          <dd className="mt-1 font-black">{formatPercent(metrics.winRate)}</dd>
        </div>
        <div>
          <dt className="text-[#777f91]">ROI</dt>
          <dd className="mt-1 font-black">{formatPercent(metrics.roi)}</dd>
        </div>
        <div>
          <dt className="text-[#777f91]">Profit</dt>
          <dd className="mt-1 font-black">{formatCoins(metrics.realizedProfit)}</dd>
        </div>
        <div>
          <dt className="text-[#777f91]">Réglés</dt>
          <dd className="mt-1 font-black">{metrics.settled}</dd>
        </div>
      </dl>
    </div>
  )
}
function Delta({
  label,
  current,
  previous,
  coins = false,
  percent = false,
}: {
  label: string
  current: number | null
  previous: number | null
  coins?: boolean
  percent?: boolean
}) {
  const delta = current === null || previous === null ? null : current - previous
  const tone = getDeltaTone(delta)
  const value = formatDelta(delta, coins, percent)
  return (
    <div>
      <p className="text-xs text-[#777f91]">{label}</p>
      <p className={`mt-1 font-black ${tone}`}>{value}</p>
    </div>
  )
}

function getDeltaTone(delta: number | null) {
  if (delta === null) return ''
  return delta >= 0 ? 'text-[#5fd3a0]' : 'text-[#f28a7f]'
}

function formatDelta(delta: number | null, coins: boolean, percent: boolean) {
  if (delta === null) return 'Indisponible'
  const prefix = delta > 0 ? '+' : ''
  if (percent) return `${prefix}${formatPercent(delta)}`
  if (coins) return `${prefix}${formatCoins(delta)}`
  return `${prefix}${delta}`
}
function AnalysisTable({
  title,
  rows,
  label,
  financial = false,
}: {
  title: string
  rows: BreakdownRow[]
  label: (row: BreakdownRow) => string
  financial?: boolean
}) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-4">
      <h3 className="text-sm font-black">{title}</h3>
      {rows.length ? (
        <div className="mt-3 divide-y divide-white/[0.06]">
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto] gap-3 py-2 text-xs">
              <span className="text-[#aeb4c2]">{label(row)}</span>
              <strong>
                {financial
                  ? `${formatCoins(row.profit ?? 0)} · ${formatPercent(row.roi ?? null)}`
                  : `${formatPercent(row.winRate ?? null)} · ${row.settled} obs.`}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-[#777f91]">Aucune donnée sur cette période</p>
      )}
    </div>
  )
}
