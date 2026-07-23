import { Search } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { Select } from '@/client/components/ui/select'
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
import type { CachedResponse, DashboardSeason } from '@/client/features/dashboard/types/dashboard-types'
import { formatCoins, formatPercent } from '@/client/features/dashboard/utils/dashboard-formatters'
import { getPreferenceProgress, hasEnoughPreferenceData } from '@/client/lib/preference'

interface Category {
  name?: string
  sport?: string
  selections: number
  wins: number
  losses: number
  winRate: number | null
}
interface SportFinance {
  sport: string
  settled: number
  stake: number
  payout: number
  profit: number
  roi: number | null
}
interface SportsData {
  season: DashboardSeason | null
  seasons: DashboardSeason[]
  sports: Category[]
  competitions: Category[]
  teams: Category[]
  breakdowns: { sportFinance: SportFinance[] }
}

export function SportsPage() {
  const { guildId } = useParams()
  const { search } = useLocation()
  const state = useDashboardData<CachedResponse<SportsData>>(`/guilds/${guildId}/performance${search}`)
  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Sports et équipes" description="Vos performances par sélection." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Sports et équipes" description="Vos performances par sélection." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  return <SportsContent response={state.data} refresh={state.refresh} />
}

function SportsContent({ response, refresh }: { response: CachedResponse<SportsData>; refresh: () => void }) {
  const data = response.data
  const favorite = data.teams[0]
  const hasFavorite = hasEnoughPreferenceData(favorite)
  const best = [...data.teams]
    .filter(row => row.wins + row.losses >= 10)
    .sort((left, right) => (right.winRate ?? 0) - (left.winRate ?? 0))[0]
  return (
    <PageFrame>
      <PageHeader
        title="Sports et équipes"
        description="Résultats par sport, compétition et équipe. Les taux utilisent les sélections réglées."
        generatedAt={response.generatedAt}
        stale={response.stale}
        onRefresh={refresh}
      />
      <SeasonFilter seasons={data.seasons} selected={data.season} />
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Équipe la plus sélectionnée"
          value={hasFavorite ? (favorite?.name ?? 'Indisponible') : 'Pas assez de données'}
          detail={hasFavorite && favorite ? `${favorite.selections} sélections` : getPreferenceProgress(favorite)}
          tone="gold"
        />
        <MetricCard
          label="Meilleur taux avec échantillon valide"
          value={best?.name ?? 'Indisponible'}
          detail={best ? `${formatPercent(best.winRate)} · ${best.wins + best.losses} sélections réglées` : 'Minimum 10 sélections réglées'}
          tone="positive"
        />
      </section>
      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <CategoryTable title="Sports" rows={data.sports} />
        <CategoryTable title="Compétitions" rows={data.competitions} searchable />
        <CategoryTable title="Équipes" rows={data.teams} searchable />
      </div>
      <section className="mt-6 rounded-md border border-white/[0.08] bg-[#181b23]">
        <div className="border-b border-white/[0.07] px-4 py-4">
          <h2 className="font-black">Rentabilité par sport</h2>
          <p className="mt-1 text-xs text-[#777f91]">
            Singles et combinés entièrement attribuables à un seul sport. Les combinés mixtes sont exclus.
          </p>
        </div>
        {data.breakdowns.sportFinance.length ? (
          <div className="divide-y divide-white/[0.06]">
            {data.breakdowns.sportFinance.map(row => (
              <div key={row.sport} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm">
                <span>
                  <strong>{row.sport}</strong>
                  <small className="ml-2 text-[#777f91]">{row.settled} tickets</small>
                </span>
                <strong className={row.profit >= 0 ? 'text-[#5fd3a0]' : 'text-[#f28a7f]'}>
                  {formatCoins(row.profit)} · {formatPercent(row.roi)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </PageFrame>
  )
}

function CategoryTable({ title, rows, searchable = false }: { title: string; rows: Category[]; searchable?: boolean }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'usage' | 'rate'>('usage')
  const visible = rows
    .filter(row => (row.name ?? row.sport ?? '').toLocaleLowerCase('fr-FR').includes(query.toLocaleLowerCase('fr-FR')))
    .sort((left, right) => (sort === 'usage' ? right.selections - left.selections : (right.winRate ?? -1) - (left.winRate ?? -1)))
    .slice(0, 20)
  return (
    <section className="rounded-md border border-white/[0.08] bg-[#181b23]">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.07] px-4">
        <h2 className="font-black">{title}</h2>
        <Select
          ariaLabel={`Trier ${title}`}
          value={sort}
          onValueChange={value => {
            setSort(value as 'usage' | 'rate')
          }}
          options={[
            { value: 'usage', label: 'Utilisation' },
            { value: 'rate', label: 'Winrate' },
          ]}
          className="h-8 min-w-[118px] bg-[#20232d] px-2 text-xs"
        />
      </div>
      {searchable && (
        <label className="relative block border-b border-white/[0.06] p-3">
          <span className="sr-only">Rechercher dans {title}</span>
          <Search className="absolute top-6 left-6 size-4 text-white/30" />
          <input
            value={query}
            onChange={event => {
              setQuery(event.target.value)
            }}
            placeholder="Rechercher"
            className="h-10 w-full rounded-md border border-white/10 bg-[#20232d] pr-3 pl-10 text-sm text-white outline-none focus:border-[#6975ff]"
          />
        </label>
      )}
      {visible.length ? (
        <div className="divide-y divide-white/[0.06]">
          {visible.map(row => (
            <div key={row.name ?? row.sport} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{row.name ?? row.sport}</p>
                <p className="mt-1 text-xs text-[#747b8d]">
                  {row.selections} sélections · {row.wins} V · {row.losses} D
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black">{formatPercent(row.winRate)}</p>
                <p className="mt-1 text-[10px] text-[#747b8d]">
                  {row.wins + row.losses >= 10 ? 'Échantillon valide' : 'Échantillon limité'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}
