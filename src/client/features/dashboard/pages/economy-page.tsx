import { useLocation, useParams, useSearchParams } from 'react-router-dom'

import { BalanceChart } from '@/client/features/dashboard/components/dashboard-charts'
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
import type { DashboardSeason } from '@/client/features/dashboard/types/dashboard-types'
import { formatCoins, formatDateTime } from '@/client/features/dashboard/utils/dashboard-formatters'

interface EconomyData {
  season: DashboardSeason | null
  seasons: DashboardSeason[]
  account: { balance: number | null; activeStake: number } | null
  entries: { id: number; type: string; amount: number; balanceAfter: number; occurredAt: string }[]
  nextCursor: string | null
  flows: { type: string; amount: number; volume: number; entries: number }[]
  balanceTrend: { date: string; balance: number; seasonId: number }[]
}

const transactionLabels: Record<string, string> = {
  SEASON_OPENING: 'Ouverture de saison',
  BET_STAKE: 'Mise simple',
  BET_PAYOUT: 'Paiement simple',
  PARLAY_STAKE: 'Mise combinée',
  PARLAY_PAYOUT: 'Paiement combiné',
  DAILY_REWARD: 'Récompense quotidienne',
  COIN_DROP: 'Distribution de pièces',
  TRANSFER_SENT: 'Transfert envoyé',
  TRANSFER_RECEIVED: 'Transfert reçu',
  BET_REFUND: 'Remboursement simple',
  PARLAY_REFUND: 'Remboursement combiné',
  SEASON_REFUND: 'Remboursement de saison',
  ADMIN_ADJUSTMENT: 'Ajustement administratif',
  MATCH_CORRECTION: 'Correction de résultat',
}

export function EconomyPage() {
  const { guildId } = useParams()
  const { search } = useLocation()
  const [params, setParams] = useSearchParams()
  const state = useDashboardData<EconomyData>(`/guilds/${guildId}/economy${search}`)

  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Économie" description="Votre solde et vos mouvements privés." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Économie" description="Votre solde et vos mouvements privés." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  return <EconomyContent data={state.data} params={params} setParams={setParams} />
}

function EconomyContent({
  data,
  params,
  setParams,
}: {
  data: EconomyData
  params: URLSearchParams
  setParams: ReturnType<typeof useSearchParams>[1]
}) {
  return (
    <PageFrame>
      <PageHeader title="Économie" description="Historique privé des mouvements de votre compte." />
      <SeasonFilter seasons={data.seasons} selected={data.season} />
      <EconomySummary account={data.account} />
      <EconomyCharts data={data} />
      <Ledger entries={data.entries} />
      <Pagination nextCursor={data.nextCursor} params={params} setParams={setParams} />
    </PageFrame>
  )
}

function EconomySummary({ account }: { account: EconomyData['account'] }) {
  const balance = account?.balance
  return (
    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard label="Solde disponible" value={balance === null || balance === undefined ? 'Indisponible' : formatCoins(balance)} />
      <MetricCard label="Mises actives" value={formatCoins(account?.activeStake ?? 0)} />
    </section>
  )
}

function EconomyCharts({ data }: { data: EconomyData }) {
  const trends = getBalanceTrends(data)
  return (
    <section className="mt-7 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-5">
        <h2 className="font-black">Évolution du solde</h2>
        {trends.length ? (
          <div className="divide-y divide-white/[0.06]">
            {trends.map(trend => (
              <div key={trend.label} className="pt-4 first:pt-0">
                <p className="text-xs font-bold text-[#9299aa]">{trend.label}</p>
                <BalanceChart data={trend.rows} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
      <div className="rounded-md border border-white/[0.08] bg-[#181b23] p-5">
        <h2 className="font-black">Flux par type</h2>
        {data.flows.length ? (
          <div className="mt-3 divide-y divide-white/[0.06]">
            {data.flows.map(flow => (
              <div key={flow.type} className="flex items-center justify-between gap-3 py-2 text-xs">
                <span>{transactionLabels[flow.type] ?? flow.type}</span>
                <strong className={flow.amount >= 0 ? 'text-[#5fd3a0]' : 'text-[#f28a7f]'}>
                  {flow.amount > 0 ? '+' : ''}
                  {formatCoins(flow.amount)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#777f91]">Aucune donnée sur cette période</p>
        )}
      </div>
    </section>
  )
}

function Ledger({ entries }: { entries: EconomyData['entries'] }) {
  return (
    <section className="mt-7 rounded-md border border-white/[0.08] bg-[#181b23]">
      <div className="border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <h2 className="font-black">Mouvements récents</h2>
      </div>
      {entries.length ? (
        <div className="divide-y divide-white/[0.06]">
          {entries.map(entry => (
            <div key={entry.id} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:px-5">
              <div>
                <p className="text-sm font-bold">{transactionLabels[entry.type] ?? entry.type}</p>
                <p className="mt-1 text-xs text-[#747b8d]">{formatDateTime(entry.occurredAt)}</p>
              </div>
              <p className={`text-sm font-black ${entry.amount >= 0 ? 'text-[#5fd3a0]' : 'text-[#f28a7f]'}`}>
                {entry.amount > 0 ? '+' : ''}
                {formatCoins(entry.amount)}
              </p>
              <p className="hidden min-w-28 text-right text-xs text-[#858c9d] sm:block">Solde {formatCoins(entry.balanceAfter)}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}

function Pagination({
  nextCursor,
  params,
  setParams,
}: {
  nextCursor: string | null
  params: URLSearchParams
  setParams: ReturnType<typeof useSearchParams>[1]
}) {
  if (!nextCursor && !params.has('cursor')) return null
  return (
    <div className="mt-4 flex justify-end gap-2">
      {params.has('cursor') && (
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params)
            next.delete('cursor')
            setParams(next)
          }}
          className="h-10 rounded-md border border-white/10 px-4 text-sm font-bold"
        >
          Précédent
        </button>
      )}
      {nextCursor && (
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params)
            next.set('cursor', nextCursor)
            setParams(next)
          }}
          className="h-10 rounded-md bg-[#5865f2] px-4 text-sm font-bold"
        >
          Afficher plus
        </button>
      )}
    </div>
  )
}

function getBalanceTrends(data: EconomyData) {
  if (data.season) return [{ label: data.season.title ?? `Saison ${data.season.number}`, rows: data.balanceTrend }]
  return data.seasons
    .map(season => ({
      label: season.title ?? `Saison ${season.number}`,
      rows: data.balanceTrend.filter(row => row.seasonId === season.id),
    }))
    .filter(trend => trend.rows.length)
}
