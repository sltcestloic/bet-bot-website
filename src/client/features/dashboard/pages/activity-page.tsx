import { useParams } from 'react-router-dom'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageFrame,
  PageHeader,
} from '@/client/features/dashboard/components/dashboard-ui'
import { useDashboardData } from '@/client/features/dashboard/hooks/use-dashboard-data'
import { formatCoins, formatInteger } from '@/client/features/dashboard/utils/dashboard-formatters'

interface ActivityData {
  days: { date: string; interactions: number; betsPlaced: number; amountStaked: number; dailyClaims: number }[]
}

export function ActivityPage() {
  const { guildId } = useParams()
  const state = useDashboardData<ActivityData>(`/guilds/${guildId}/activity?days=30`)
  if (state.loading)
    return (
      <PageFrame>
        <PageHeader title="Activité" description="Votre activité personnelle récente." />
        <LoadingState />
      </PageFrame>
    )
  if (state.error || !state.data)
    return (
      <PageFrame>
        <PageHeader title="Activité" description="Votre activité personnelle récente." />
        <ErrorState retry={state.refresh} />
      </PageFrame>
    )
  const totals = state.data.days.reduce(
    (sum, day) => ({
      interactions: sum.interactions + day.interactions,
      bets: sum.bets + day.betsPlaced,
      stake: sum.stake + day.amountStaked,
      claims: sum.claims + day.dailyClaims,
    }),
    { interactions: 0, bets: 0, stake: 0, claims: 0 },
  )
  return (
    <PageFrame>
      <PageHeader title="Activité" description="Données proches du temps réel · 30 derniers jours" />
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Interactions" value={formatInteger(totals.interactions)} />
        <MetricCard label="Tickets placés" value={formatInteger(totals.bets)} />
        <MetricCard label="Montant misé" value={formatCoins(totals.stake)} />
        <MetricCard label="Récompenses quotidiennes" value={formatInteger(totals.claims)} />
      </section>
      <section className="mt-7 rounded-md border border-white/[0.08] bg-[#181b23] p-5">
        <h2 className="font-black">Jours actifs</h2>
        {state.data.days.length ? (
          <div className="mt-5 grid grid-cols-10 gap-2 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
            {state.data.days.map(day => (
              <div
                key={day.date}
                title={`${day.date} · ${day.interactions} interactions`}
                className={`aspect-square rounded-sm ${getActivityColor(day.interactions)}`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState />
          </div>
        )}
      </section>
    </PageFrame>
  )
}

function getActivityColor(interactions: number) {
  if (interactions > 10) return 'bg-[#5865f2]'
  if (interactions > 0) return 'bg-[#5865f2]/40'
  return 'bg-white/5'
}
