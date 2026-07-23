import { Activity, Coins, Crosshair, Flame, Gift, Radio, Sparkles, Target, Trophy } from 'lucide-react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'

import { GameTrend } from '@/client/features/game/components/game-charts'
import { GameSeasonSelect, SegmentedFilter } from '@/client/features/game/components/game-filters'
import { GameEmpty, GameError, GameFrame, GameLoading, GamePageHeader, GamePanel } from '@/client/features/game/components/game-ui'
import { useGameData } from '@/client/features/game/hooks/use-game-data'
import type { CachedResponse, GameSeason, MetricSummary, OverviewData } from '@/client/features/game/types/game-types'
import { formatCoins, formatOdds, formatPercent } from '@/client/features/game/utils/game-formatters'
import { getPreferenceProgress, hasEnoughPreferenceData } from '@/client/lib/preference'

interface Category {
  name?: string
  sport?: string
  selections: number
  wins: number
  losses: number
  winRate: number | null
}
interface Performance {
  season: GameSeason | null
  seasons: GameSeason[]
  metrics: MetricSummary
  singles: MetricSummary
  parlays: MetricSummary
  trend: OverviewData['trend']
  sports: Category[]
  competitions: Category[]
  teams: Category[]
  recentForm: OverviewData['recentForm']
  streaks: OverviewData['streaks']
  breakdowns: { phases?: { phase: string; settled: number; wins: number; winRate: number | null }[] }
}
interface Economy {
  season: GameSeason | null
  seasons: GameSeason[]
  account: { balance: number; activeStake: number } | null
  trend?: Record<string, string | number>[]
  entries: { id: number; type: string; amount: number; balanceAfter: number; occurredAt: string }[]
  byType?: { type: string; amount: number }[]
}
interface ActivityData {
  days: { date: string; betsPlaced: number; amountStaked: number; dailyClaims: number }[]
}

export function StatsPage() {
  const { guildId = '' } = useParams()
  const { search } = useLocation()

  return <StatsPageContent key={`${guildId}${search}`} guildId={guildId} search={search} />
}

function StatsPageContent({ guildId, search }: { guildId: string; search: string }) {
  const [params] = useSearchParams()
  const tab = params.get('tab') ?? 'performance'
  const state = useGameData<CachedResponse<Performance> | Economy | ActivityData>(`/guilds/${guildId}/stats${search}`)
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
  const raw = state.data as CachedResponse<Performance>
  const data: unknown = raw.data ?? state.data
  return (
    <GameFrame>
      <GamePageHeader eyebrow="Carnet de jeu" title="Statistiques" stale={'stale' in state.data ? state.data.stale : false} />
      <div className="mt-6 max-w-full overflow-x-auto">
        <SegmentedFilter
          name="tab"
          fallback="performance"
          options={[
            { value: 'performance', label: 'Performance' },
            { value: 'affinities', label: 'Affinités' },
            { value: 'economy', label: 'Économie' },
            { value: 'activity', label: 'Activité' },
          ]}
        />
      </div>
      {tab === 'performance' && <PerformanceTab data={data as Performance} />}
      {tab === 'affinities' && <AffinitiesTab data={data as Performance} />}
      {tab === 'economy' && <EconomyTab data={data as Economy} />}
      {tab === 'activity' && <ActivityTab data={data as ActivityData} />}
    </GameFrame>
  )
}

function PerformanceTab({ data }: { data: Performance }) {
  return (
    <>
      <div className="mt-5">
        <GameSeasonSelect seasons={data.seasons} selected={data.season} allowAll />
      </div>
      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Trophy} label="Victoires / défaites" value={`${data.metrics.wins} / ${data.metrics.losses}`} />
        <Stat icon={Target} label="Winrate" value={formatPercent(data.metrics.winRate)} />
        <Stat icon={Coins} label="Profit net" value={formatCoins(data.metrics.realizedProfit)} />
        <Stat icon={Flame} label="Meilleure série" value={`${data.streaks.longestWinning} V`} />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.85fr]">
        <GamePanel className="p-5">
          <h2 className="font-black">Profit cumulé</h2>
          {data.trend.length ? <GameTrend data={data.trend} /> : <GameEmpty />}
        </GamePanel>
        <GamePanel className="p-5">
          <h2 className="font-black">Simple ou combiné ?</h2>
          <Versus label="Tickets simples" metrics={data.singles} />
          <Versus label="Combinés" metrics={data.parlays} />
          <div className="mt-5 border-t border-white/[.07] pt-4">
            <p className="text-xs text-white/40">Cote gagnante record</p>
            <strong className="mt-1 block text-xl text-[#ffe093]">{formatOdds(data.metrics.highestWinningOdds)}</strong>
          </div>
        </GamePanel>
      </div>
    </>
  )
}
function AffinitiesTab({ data }: { data: Performance }) {
  const favoriteSport = data.sports[0]
  const favoriteTeam = data.teams[0]
  const favoriteCompetition = data.competitions[0]
  const phase = [...(data.breakdowns.phases ?? [])].sort((a, b) => b.settled - a.settled)[0]
  return (
    <>
      <div className="mt-5">
        <GameSeasonSelect seasons={data.seasons} selected={data.season} allowAll />
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Affinity icon={Trophy} label="Sport favori" item={favoriteSport} />
        <Affinity icon={Crosshair} label="Équipe la plus sélectionnée" item={favoriteTeam} />
        <Affinity icon={Sparkles} label="Compétition favorite" item={favoriteCompetition} />
      </section>
      <GamePanel className="mt-6 p-5">
        <h2 className="font-black">Votre préférence de jeu</h2>
        <div className="mt-5 flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-lg bg-[#5865f2]/12 text-[#9da5ff]">
            {phase?.phase === 'LIVE' ? <Radio className="size-5" /> : <Target className="size-5" />}
          </span>
          <div>
            <strong>{getPhasePreference(phase?.phase)}</strong>
            <p className="mt-1 text-xs text-white/42">
              {phase ? `${phase.settled} sélections terminées` : 'Aucune donnée sur cette période'}
            </p>
          </div>
        </div>
      </GamePanel>
    </>
  )
}
function EconomyTab({ data }: { data: Economy }) {
  return (
    <>
      <div className="mt-5">
        <GameSeasonSelect seasons={data.seasons} selected={data.season} />
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Stat icon={Coins} label="Solde disponible" value={formatCoins(data.account?.balance ?? 0)} />
        <Stat icon={Target} label="Mises actives" value={formatCoins(data.account?.activeStake ?? 0)} />
      </section>
      <GamePanel className="mt-6 p-5">
        <h2 className="font-black">Journal des mouvements</h2>
        <div className="mt-4 divide-y divide-white/[.06]">
          {data.entries?.slice(0, 12).map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-white/58">{transactionLabel(entry.type)}</span>
              <strong className={entry.amount >= 0 ? 'text-[#65dca7]' : 'text-[#f49589]'}>
                {entry.amount >= 0 ? '+' : ''}
                {formatCoins(entry.amount)}
              </strong>
            </div>
          ))}
          {!data.entries?.length && <GameEmpty />}
        </div>
      </GamePanel>
    </>
  )
}
function ActivityTab({ data }: { data: ActivityData }) {
  const tickets = data.days.reduce((sum, day) => sum + day.betsPlaced, 0)
  const claims = data.days.reduce((sum, day) => sum + day.dailyClaims, 0)
  const activeDays = data.days.length
  return (
    <>
      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={Activity} label="Jours actifs" value={String(activeDays)} />
        <Stat icon={Trophy} label="Tickets" value={String(tickets)} />
        <Stat icon={Gift} label="Récompenses" value={String(claims)} />
      </section>
      <GamePanel className="mt-6 p-5">
        <h2 className="font-black">30 derniers jours</h2>
        <div className="mt-5 grid grid-cols-10 gap-2 sm:grid-cols-15">
          {data.days.map(day => (
            <span
              key={day.date}
              title={`${day.date} · ${day.betsPlaced} tickets`}
              className={`aspect-square rounded-sm ${getBetActivityColor(day.betsPlaced)}`}
            />
          ))}
        </div>
      </GamePanel>
    </>
  )
}

function getPhasePreference(phase?: string) {
  if (phase === 'LIVE') return 'Plutôt en direct'
  if (phase) return 'Plutôt avant-match'
  return 'Pas encore définie'
}

function getBetActivityColor(betsPlaced: number) {
  if (betsPlaced > 2) return 'bg-[#35c58a]'
  if (betsPlaced > 0) return 'bg-[#5865f2]'
  return 'bg-white/[.06]'
}
function Stat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <GamePanel className="min-h-28 p-4">
      <Icon className="size-5 text-[#929bff]" />
      <p className="mt-3 text-[10px] font-black text-white/35 uppercase">{label}</p>
      <strong className="mt-1 block text-lg sm:text-xl">{value}</strong>
    </GamePanel>
  )
}
function Versus({ label, metrics }: { label: string; metrics: MetricSummary }) {
  return (
    <div className="mt-4 rounded-lg bg-white/[.035] p-4">
      <div className="flex justify-between">
        <strong className="text-sm">{label}</strong>
        <span className="text-sm font-black text-[#9fa6ff]">{formatPercent(metrics.winRate)}</span>
      </div>
      <p className="mt-1 text-xs text-white/38">
        {metrics.wins} victoires · {metrics.losses} défaites
      </p>
    </div>
  )
}
function Affinity({ icon: Icon, label, item }: { icon: typeof Trophy; label: string; item?: Category }) {
  const name = item?.name ?? item?.sport
  const hasEnoughData = hasEnoughPreferenceData(item)
  return (
    <GamePanel className="p-5">
      <Icon className="size-5 text-[#f4c25b]" />
      <p className="mt-4 text-[10px] font-black text-white/35 uppercase">{label}</p>
      <strong className="mt-1 block text-lg">{hasEnoughData ? (name ?? '—') : 'Pas assez de données'}</strong>
      <p className="mt-2 text-xs text-white/40">
        {hasEnoughData && item
          ? `${item.selections} sélection${item.selections > 1 ? 's' : ''} · ${formatPercent(item.winRate)}`
          : getPreferenceProgress(item)}
      </p>
    </GamePanel>
  )
}
function transactionLabel(type: string) {
  return (
    (
      {
        SEASON_OPENING: 'Début de saison',
        BET_STAKE: 'Mise simple',
        BET_PAYOUT: 'Gain simple',
        PARLAY_STAKE: 'Mise combinée',
        PARLAY_PAYOUT: 'Gain combiné',
        DAILY_REWARD: 'Récompense quotidienne',
        COIN_DROP: 'Pièces récupérées',
        TRANSFER_SENT: 'Transfert envoyé',
        TRANSFER_RECEIVED: 'Transfert reçu',
        BET_REFUND: 'Remboursement',
        PARLAY_REFUND: 'Remboursement combiné',
      } as Record<string, string>
    )[type] ?? 'Ajustement'
  )
}
