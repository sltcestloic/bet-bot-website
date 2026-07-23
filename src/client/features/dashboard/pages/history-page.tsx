import { useLocation, useParams, useSearchParams } from 'react-router-dom'

import { DashboardFilters } from '@/client/features/dashboard/components/dashboard-filters'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageFrame,
  PageHeader,
  SeasonFilter,
} from '@/client/features/dashboard/components/dashboard-ui'
import { TicketList } from '@/client/features/dashboard/components/ticket-list'
import { useDashboardData } from '@/client/features/dashboard/hooks/use-dashboard-data'
import type { DashboardSeason, Ticket } from '@/client/features/dashboard/types/dashboard-types'

interface HistoryData {
  season: DashboardSeason | null
  seasons: DashboardSeason[]
  tickets: Ticket[]
  nextCursor: string | null
}

export function HistoryPage() {
  const { guildId } = useParams()
  const { search } = useLocation()
  const [params, setParams] = useSearchParams()
  const state = useDashboardData<HistoryData>(`/guilds/${guildId}/history${search}`)
  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Historique" description="Tous vos tickets, y compris ceux en attente ou annulés." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Historique" description="Tous vos tickets, y compris ceux en attente ou annulés." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  const nextCursor = state.data.nextCursor
  return (
    <PageFrame>
      <PageHeader title="Historique" description="Tickets simples et combinés, ordonnés par date de placement." />
      <SeasonFilter seasons={state.data.seasons} selected={state.data.season} />
      <DashboardFilters detailed />
      <section className="mt-6 rounded-md border border-white/[0.08] bg-[#181b23] px-4 sm:px-5">
        {state.data.tickets.length ? <TicketList tickets={state.data.tickets} /> : <EmptyState />}
      </section>
      {(nextCursor || params.has('cursor')) && (
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
      )}
    </PageFrame>
  )
}
