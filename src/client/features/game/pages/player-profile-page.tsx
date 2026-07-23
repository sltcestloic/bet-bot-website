import { Flame, Medal, Target, Trophy } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'

import { GameSeasonSelect } from '@/client/features/game/components/game-filters'
import { GameTicketList } from '@/client/features/game/components/game-ticket-list'
import { GameEmpty, GameError, GameFrame, GameLoading, GamePageHeader, GamePanel } from '@/client/features/game/components/game-ui'
import { RankEmblem } from '@/client/features/game/components/rank-emblem'
import { useGameData } from '@/client/features/game/hooks/use-game-data'
import type { GameSeason, MetricSummary, OverviewData } from '@/client/features/game/types/game-types'
import { formatOdds, formatPercent } from '@/client/features/game/utils/game-formatters'
import { hasEnoughPreferenceData } from '@/client/lib/preference'

interface Category {
  name?: string
  sport?: string
  selections: number
  winRate: number | null
}
interface PublicData {
  profile: { discordId: string; displayName: string; username: string | null; avatarUrl: string } | null
  overview: OverviewData
  performance: {
    season: GameSeason | null
    seasons: GameSeason[]
    metrics: MetricSummary
    sports: Category[]
    teams: Category[]
    competitions: Category[]
  }
}

export function PlayerProfilePage() {
  const { guildId = '', discordId = '' } = useParams()
  const { search } = useLocation()
  const state = useGameData<PublicData>(`/guilds/${guildId}/players/${discordId}${search}`)
  if (state.loading)
    return (
      <GameFrame>
        <GameLoading />
      </GameFrame>
    )
  if (state.error || !state.data?.profile)
    return (
      <GameFrame>
        <GameError retry={state.refresh} />
      </GameFrame>
    )
  return <PlayerProfileContent data={state.data} profile={state.data.profile} />
}

function PlayerProfileContent({ data, profile }: { data: PublicData; profile: NonNullable<PublicData['profile']> }) {
  const { overview, performance } = data
  const movement = overview.rank?.rank && overview.previousRank ? overview.previousRank - overview.rank.rank : null
  return (
    <GameFrame>
      <GamePageHeader eyebrow="Profil public" title={profile.displayName} />
      <div className="mt-6">
        <GameSeasonSelect seasons={performance.seasons} selected={performance.season} />
      </div>
      <PlayerPlate profile={profile} overview={overview} performance={performance} movement={movement} />
      <PublicStats overview={overview} performance={performance} />
      <ProfileDetails overview={overview} performance={performance} />
    </GameFrame>
  )
}

function PlayerPlate({
  profile,
  overview,
  performance,
  movement,
}: {
  profile: NonNullable<PublicData['profile']>
  overview: OverviewData
  performance: PublicData['performance']
  movement: number | null
}) {
  return (
    <section className="player-plate mt-5 grid gap-5 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <RankEmblem rank={overview.rank?.rank ?? null} movement={movement} />
      <div className="flex items-center gap-4">
        <img src={profile.avatarUrl} alt="" className="size-20 rounded-xl border-2 border-white/15 bg-white/5" />
        <div>
          <h2 className="text-2xl font-black">{profile.displayName}</h2>
          <p className="mt-1 text-sm text-white/42">@{profile.username}</p>
          <div className="mt-3 flex gap-2">
            {overview.recentForm.slice(0, 5).map((result, index) => (
              <span key={index} className={`form-chip ${result === 'WON' ? 'form-win' : 'form-loss'}`}>
                {result === 'WON' ? 'V' : 'D'}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 text-right">
        <div>
          <p className="text-[10px] font-black text-white/35 uppercase">Saison</p>
          <strong className="mt-1 block">
            {performance.metrics.wins}V · {performance.metrics.losses}D
          </strong>
        </div>
        <div>
          <p className="text-[10px] font-black text-white/35 uppercase">Winrate</p>
          <strong className="mt-1 block text-[#65dca7]">{formatPercent(performance.metrics.winRate)}</strong>
        </div>
      </div>
    </section>
  )
}

function PublicStats({ overview, performance }: { overview: OverviewData; performance: PublicData['performance'] }) {
  const favoriteSport = performance.sports[0]
  const favoriteTeam = performance.teams[0]
  return (
    <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <PublicStat icon={Flame} label="Série actuelle" value={getCurrentStreakLabel(overview)} />
      <PublicStat icon={Medal} label="Meilleure série" value={`${overview.streaks.longestWinning} V`} />
      <PublicStat
        icon={Trophy}
        label="Sport favori"
        value={hasEnoughPreferenceData(favoriteSport) ? (favoriteSport.sport ?? '—') : 'Pas assez de données'}
        detail={hasEnoughPreferenceData(favoriteSport) ? undefined : 'Minimum 3 sélections'}
      />
      <PublicStat
        icon={Target}
        label="Équipe favorite"
        value={hasEnoughPreferenceData(favoriteTeam) ? (favoriteTeam.name ?? '—') : 'Pas assez de données'}
        detail={hasEnoughPreferenceData(favoriteTeam) ? undefined : 'Minimum 3 sélections'}
      />
    </section>
  )
}

function ProfileDetails({ overview, performance }: { overview: OverviewData; performance: PublicData['performance'] }) {
  const favoriteCompetition = performance.competitions[0]
  const hasFavoriteCompetition = hasEnoughPreferenceData(favoriteCompetition)
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
      <GamePanel className="p-5">
        <h2 className="font-black">Tickets récents</h2>
        {overview.recentTickets.length ? (
          <div className="mt-4">
            <GameTicketList tickets={overview.recentTickets} />
          </div>
        ) : (
          <GameEmpty />
        )}
      </GamePanel>
      <GamePanel className="record-panel h-fit self-start p-5">
        <p className="text-[10px] font-black tracking-[.16em] text-[#f4c25b] uppercase">Records</p>
        <PublicRecord label="Cote gagnante record" value={formatOdds(performance.metrics.highestWinningOdds)} />
        <PublicRecord label="Plus longue série" value={`${overview.streaks.longestWinning} V`} />
        <PublicRecord
          label="Compétition favorite"
          value={hasFavoriteCompetition ? (favoriteCompetition.name ?? '—') : 'Pas assez de données'}
          detail={hasFavoriteCompetition ? undefined : 'Minimum 3 sélections'}
        />
      </GamePanel>
    </div>
  )
}

function getCurrentStreakLabel(overview: OverviewData) {
  if (!overview.streaks.current) return '—'
  const suffix = overview.streaks.current.outcome === 'WON' ? 'V' : 'D'
  return `${overview.streaks.current.length} ${suffix}`
}
function PublicStat({ icon: Icon, label, value, detail }: { icon: typeof Trophy; label: string; value: string; detail?: string }) {
  return (
    <GamePanel className="p-4">
      <Icon className="size-5 text-[#929bff]" />
      <p className="mt-3 text-[10px] font-black text-white/35 uppercase">{label}</p>
      <strong className="mt-1 block truncate">{value}</strong>
      {detail && <span className="mt-1 block text-[10px] text-white/38">{detail}</span>}
    </GamePanel>
  )
}
function PublicRecord({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="mt-5 border-t border-white/[.07] pt-4">
      <p className="text-xs text-white/42">{label}</p>
      <strong className="mt-1 block text-[#ffe093]">{value}</strong>
      {detail && <span className="mt-1 block text-[10px] text-white/38">{detail}</span>}
    </div>
  )
}
