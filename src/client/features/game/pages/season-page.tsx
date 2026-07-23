import { CalendarDays, Flame, Medal, Trophy } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'

import { GameTrend } from '@/client/features/game/components/game-charts'
import { GameSeasonSelect } from '@/client/features/game/components/game-filters'
import { GameEmpty, GameError, GameFrame, GameLoading, GamePageHeader, GamePanel } from '@/client/features/game/components/game-ui'
import { useGameData } from '@/client/features/game/hooks/use-game-data'
import type { GameSeason, MetricSummary, OverviewData } from '@/client/features/game/types/game-types'
import { formatCoins, formatOdds, formatPercent } from '@/client/features/game/utils/game-formatters'

interface Performance {
  metrics: MetricSummary
  trend: OverviewData['trend']
  recentForm: OverviewData['recentForm']
  streaks: OverviewData['streaks']
  seasons: GameSeason[]
  season: GameSeason | null
}
interface Data {
  overview: OverviewData
  performance: Performance
  generatedAt: string
}

export function SeasonPage() {
  const { guildId = '' } = useParams()
  const { search } = useLocation()
  const state = useGameData<Data>(`/guilds/${guildId}/season${search}`)
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
  return <SeasonContent data={state.data} />
}

function SeasonContent({ data }: { data: Data }) {
  const { overview, performance } = data
  const season = overview.season
  return (
    <GameFrame>
      <GamePageHeader eyebrow="Récapitulatif" title="Ma saison" />
      <div className="mt-6">
        <GameSeasonSelect seasons={overview.seasons} selected={season} />
      </div>
      <SeasonBody overview={overview} performance={performance} />
    </GameFrame>
  )
}

function SeasonBody({ overview, performance }: { overview: OverviewData; performance: Performance }) {
  if (!overview.account?.participatedAt) {
    return <GameEmpty title="Aucune participation pour cette saison" description="Vos résultats apparaîtront après votre premier ticket." />
  }
  const season = overview.season
  return (
    <>
      <section className="season-banner mt-6 grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-black tracking-[.15em] text-[#9fa6ff] uppercase">Saison {season?.number}</p>
          <h2 className="mt-2 text-2xl font-black">{season?.title ?? 'La compétition continue'}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/48">
            <CalendarDays className="size-4" />
            {getSeasonPeriodLabel(season)}
          </p>
        </div>
        <div className="flex gap-6">
          <BigValue label="Rang" value={overview.rank?.rank ? `#${overview.rank.rank}` : '—'} />
          <BigValue label="Profit net" value={formatCoins(performance.metrics.realizedProfit)} />
        </div>
      </section>
      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SeasonStat icon={Trophy} label="Victoires / défaites" value={`${performance.metrics.wins} / ${performance.metrics.losses}`} />
        <SeasonStat icon={Medal} label="Winrate" value={formatPercent(performance.metrics.winRate)} />
        <SeasonStat
          icon={Flame}
          label="Série actuelle"
          value={
            performance.streaks.current
              ? `${performance.streaks.current.length} ${performance.streaks.current.outcome === 'WON' ? 'V' : 'D'}`
              : '—'
          }
        />
        <SeasonStat icon={Medal} label="Meilleure série" value={`${performance.streaks.longestWinning} V`} />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <GamePanel className="p-5">
          <h2 className="font-black">Mon parcours</h2>
          <p className="mt-1 text-xs text-white/38">Profit cumulé des tickets terminés</p>
          {performance.trend.length ? <GameTrend data={performance.trend} /> : <GameEmpty />}
        </GamePanel>
        <GamePanel className="record-panel p-5">
          <p className="text-[10px] font-black tracking-[.16em] text-[#f4c25b] uppercase">Temps forts</p>
          <Highlight
            label="Plus gros gain"
            value={performance.metrics.largestNetWin === null ? '—' : formatCoins(performance.metrics.largestNetWin)}
          />
          <Highlight label="Cote record" value={formatOdds(performance.metrics.highestWinningOdds)} />
          <Highlight label="Tickets terminés" value={String(performance.metrics.settled)} />
        </GamePanel>
      </div>
    </>
  )
}

function getSeasonPeriodLabel(season: GameSeason | null) {
  if (season?.bettingClosesAt) {
    return `Fin des prédictions prévue le ${formatSeasonDate(season.bettingClosesAt)}`
  }
  return `Commencée le ${formatSeasonDate(season?.startsAt ?? '')} · date de fin à venir`
}

function formatSeasonDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
}
function BigValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-black text-white/35 uppercase">{label}</p>
      <strong className="mt-1 block text-xl text-[#ffe093]">{value}</strong>
    </div>
  )
}
function SeasonStat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <GamePanel className="p-4">
      <Icon className="size-5 text-[#8f98ff]" />
      <p className="mt-3 text-[10px] font-black text-white/35 uppercase">{label}</p>
      <strong className="mt-1 block text-lg">{value}</strong>
    </GamePanel>
  )
}
function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-5 flex items-center justify-between border-t border-white/[.07] pt-4">
      <span className="text-sm text-white/45">{label}</span>
      <strong className="text-[#ffe093]">{value}</strong>
    </div>
  )
}
