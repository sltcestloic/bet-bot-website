import { AlertCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Select, type SelectOption } from '@/client/components/ui/select'
import type { DashboardSeason } from '@/client/features/dashboard/types/dashboard-types'
import { formatRelativeTime } from '@/client/features/dashboard/utils/dashboard-formatters'

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">{children}</div>
}

export function PageHeader({
  title,
  description,
  generatedAt,
  stale,
  refreshing,
  onRefresh,
}: {
  title: string
  description: string
  generatedAt?: string
  stale?: boolean
  refreshing?: boolean
  onRefresh?: () => void
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-black sm:text-2xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#9298a8]">{description}</p>
      </div>
      {generatedAt && (
        <div className="flex items-center gap-3 text-xs text-[#7f8698]">
          <span>{stale ? 'Données temporairement anciennes' : `Mis à jour ${formatRelativeTime(generatedAt)}`}</span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex size-9 items-center justify-center rounded-md border border-white/10 text-white/60 hover:text-white"
              title="Rafraîchir"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export function SeasonFilter({ seasons, selected }: { seasons: DashboardSeason[]; selected: DashboardSeason | null }) {
  const [params, setParams] = useSearchParams()
  const options: SelectOption[] = [
    { value: 'all', label: 'Toutes les saisons', leading: <span className="size-2 rounded-full bg-[#777f91]" /> },
    ...seasons.map(season => ({
      value: String(season.id),
      label: `Saison ${season.number}${season.title ? ` · ${season.title}` : ''}`,
      leading: <SeasonStatus status={season.status} />,
    })),
  ]
  const changeSeason = (value: string) => {
    const next = new URLSearchParams(params)
    next.set('season', value)
    next.delete('cursor')
    setParams(next)
  }
  return (
    <div className="mt-5 inline-flex items-center gap-3 text-xs font-bold text-[#8f96a8]">
      <span>Saison</span>
      <Select
        ariaLabel="Saison"
        value={String(selected?.id ?? 'all')}
        onValueChange={changeSeason}
        options={options}
        className="max-w-[min(78vw,360px)]"
      />
    </div>
  )
}

function SeasonStatus({ status }: { status: string }) {
  const color = getSeasonStatusColor(status)
  return <span className={`size-2 rounded-full ${color}`} aria-hidden="true" />
}

function getSeasonStatusColor(status: string) {
  if (status === 'ACTIVE') return 'bg-[#5fd3a0]'
  if (status === 'CLOSING') return 'bg-[#f4c25b]'
  return 'bg-[#777f91]'
}

export function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  detail?: string
  tone?: 'neutral' | 'positive' | 'negative' | 'gold'
}) {
  const colors = { neutral: 'text-white', positive: 'text-[#5fd3a0]', negative: 'text-[#f28a7f]', gold: 'text-[#f4c25b]' }
  return (
    <div className="min-h-[116px] rounded-md border border-white/[0.08] bg-[#181b23] p-4">
      <p className="text-xs font-bold text-[#858c9d]">{label}</p>
      <p className={`mt-3 text-2xl font-black ${colors[tone]}`}>{value}</p>
      {detail && <p className="mt-2 text-xs text-[#747b8d]">{detail}</p>}
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Chargement">
      <span className="h-28 animate-pulse rounded-md bg-white/[0.05]" />
      <span className="h-28 animate-pulse rounded-md bg-white/[0.05]" />
      <span className="h-28 animate-pulse rounded-md bg-white/[0.05]" />
      <span className="h-28 animate-pulse rounded-md bg-white/[0.05]" />
    </div>
  )
}

export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="mt-8 border-y border-[#f07468]/20 py-12 text-center">
      <AlertCircle className="mx-auto size-7 text-[#f28a7f]" />
      <h2 className="mt-3 font-black">Impossible de charger les données</h2>
      <p className="mt-2 text-sm text-[#9298a8]">Le service est momentanément indisponible.</p>
      <button type="button" onClick={retry} className="mt-5 h-10 rounded-md bg-white/10 px-4 text-sm font-bold hover:bg-white/15">
        Réessayer
      </button>
    </div>
  )
}

export function EmptyState({ title = 'Aucune donnée sur cette période', description }: { title?: string; description?: string }) {
  return (
    <div className="border-y border-white/[0.08] py-12 text-center">
      <h2 className="font-black">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-[#858c9d]">{description}</p>}
    </div>
  )
}
