import { ArrowRight, Flame, Medal, Sparkles, Ticket, Trophy } from 'lucide-react'
import { Link, useParams, useRouteLoaderData } from 'react-router-dom'

import { GameTicketList } from '@/client/features/game/components/game-ticket-list'
import { GameEmpty, GameError, GameFrame, GameLoading, GamePageHeader, GamePanel } from '@/client/features/game/components/game-ui'
import { RankEmblem } from '@/client/features/game/components/rank-emblem'
import { RewardReveal } from '@/client/features/game/components/reward-reveal'
import { useGameData } from '@/client/features/game/hooks/use-game-data'
import type { CachedResponse, GameRootData, LeaderboardRow, OverviewData } from '@/client/features/game/types/game-types'
import { formatCoins, formatOdds, formatPercent } from '@/client/features/game/utils/game-formatters'

export function ProfilePage() {
  const { guildId = '' } = useParams()
  const root = useRouteLoaderData<GameRootData>('game')
  if (!root) throw new Error('Game route data is unavailable')
  const state = useGameData<CachedResponse<OverviewData>>(`/guilds/${guildId}/profile`)
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
  const { data } = state.data
  if (!data.account?.participatedAt)
    return (
      <GameFrame>
        <GamePageHeader title="Mon profil" stale={state.data.stale} />
        <div className="mt-8">
          <GameEmpty
            title="Votre profil attend son premier ticket"
            description="Placez une prédiction sur Discord pour entrer dans l’arène et débloquer vos statistiques."
            action={
              <a
                href={`https://discord.com/channels/${guildId}`}
                className="inline-flex rounded-md bg-[#5865f2] px-5 py-3 text-sm font-black"
              >
                Ouvrir Discord
              </a>
            }
          />
        </div>
      </GameFrame>
    )
  return <ProfileContent data={data} root={root} guildId={guildId} stale={state.data.stale} />
}

function ProfileContent({ data, root, guildId, stale }: { data: OverviewData; root: GameRootData; guildId: string; stale: boolean }) {
  const account = data.account
  if (!account) throw new Error('Player account is unavailable')
  const movement = data.rank?.rank && data.previousRank ? data.previousRank - data.rank.rank : null
  const active = data.activeTickets ?? data.recentTickets.filter(ticket => ticket.outcome === 'PENDING')
  const finished = data.recentResults ?? data.recentTickets.filter(ticket => ticket.outcome !== 'PENDING')
  const board = data.leaderboards.balance ?? []
  const viewerIndex = board.findIndex(row => row.isViewer)
  const rivals = viewerIndex >= 0 ? board.slice(Math.max(0, viewerIndex - 2), viewerIndex + 3) : []
  return (
    <GameFrame>
      {data.celebration && <RewardReveal guildId={guildId} achievement={data.celebration} />}
      <GamePageHeader eyebrow={`Saison ${data.season?.number ?? 'active'}`} title="Mon profil" stale={stale} />
      <ProfilePlate data={data} root={root} account={account} movement={movement} />
      <ProfileStats data={data} />
      <ProfilePanels data={data} guildId={guildId} active={active} finished={finished} rivals={rivals} />
    </GameFrame>
  )
}

function ProfilePlate({
  data,
  root,
  account,
  movement,
}: {
  data: OverviewData
  root: GameRootData
  account: NonNullable<OverviewData['account']>
  movement: number | null
}) {
  return (
    <section className="player-plate mt-6 grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-7">
      <RankEmblem rank={data.rank?.rank ?? null} movement={movement} />
      <div className="flex min-w-0 items-center gap-4">
        <img src={root.user.avatarUrl} alt="" className="size-16 rounded-xl border-2 border-white/15 bg-white/5 shadow-xl sm:size-20" />
        <div className="min-w-0">
          <p className="truncate text-xl font-black sm:text-2xl">{root.user.displayName}</p>
          <p className="truncate text-sm text-white/42">@{root.user.username}</p>
          <div className="mt-3 flex gap-2">
            {data.recentForm.slice(0, 5).map((result, index) => (
              <span key={index} className={`form-chip ${result === 'WON' ? 'form-win' : 'form-loss'}`}>
                {result === 'WON' ? 'V' : 'D'}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:block sm:text-right">
        <div>
          <p className="text-[10px] font-black text-white/35 uppercase">Solde disponible</p>
          <p className="mt-1 text-xl font-black text-[#ffe093]" aria-label={`${account.balance ?? 0} pièces`}>
            {formatCoins(account.balance ?? 0)}
          </p>
        </div>
        <div className="sm:mt-3">
          <p className="text-[10px] font-black text-white/35 uppercase">Profit net</p>
          <p className={`mt-1 font-black ${data.metrics.realizedProfit >= 0 ? 'text-[#65dca7]' : 'text-[#f49589]'}`}>
            {formatCoins(data.metrics.realizedProfit)}
          </p>
        </div>
      </div>
    </section>
  )
}

function ProfileStats({ data }: { data: OverviewData }) {
  return (
    <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <HudStat icon={Trophy} label="Saison" value={`${data.metrics.wins}V · ${data.metrics.losses}D`} />
      <HudStat icon={Sparkles} label="Winrate" value={formatPercent(data.metrics.winRate)} />
      <HudStat icon={Flame} label="Série actuelle" value={getStreakLabel(data)} />
      <HudStat icon={Medal} label="Record gagnant" value={`${data.streaks.longestWinning} victoire(s)`} />
    </section>
  )
}

function ProfilePanels({
  data,
  guildId,
  active,
  finished,
  rivals,
}: {
  data: OverviewData
  guildId: string
  active: OverviewData['recentTickets']
  finished: OverviewData['recentTickets']
  rivals: LeaderboardRow[]
}) {
  return (
    <div className="mt-7 grid gap-6 lg:grid-cols-[1.45fr_.75fr]">
      <div className="space-y-6">
        <GamePanel className="p-4 sm:p-5">
          <SectionTitle icon={Ticket} title="Tickets en cours" link="../tickets?view=active" />
          {active.length ? (
            <div className="mt-4">
              <GameTicketList tickets={active} />
            </div>
          ) : (
            <GameEmpty title="Aucun ticket en cours" description="La prochaine prédiction se joue sur Discord." />
          )}
        </GamePanel>
        <GamePanel className="p-4 sm:p-5">
          <SectionTitle icon={Trophy} title="Derniers résultats" link="../tickets?view=settled" />
          {finished.length ? (
            <div className="mt-4">
              <GameTicketList tickets={finished} />
            </div>
          ) : (
            <GameEmpty />
          )}
        </GamePanel>
      </div>
      <div className="space-y-6 self-start">
        <GamePanel className="p-5">
          <h2 className="font-black">Rivaux proches</h2>
          <div className="mt-4 space-y-2">
            {rivals.map(row => (
              <RivalRow key={row.discordId} row={row} guildId={guildId} />
            ))}
            {!rivals.length && <p className="py-5 text-center text-sm text-white/40">Classement à venir</p>}
          </div>
          <Link
            to="../leaderboard"
            className="mt-4 flex items-center justify-center gap-2 rounded-md bg-white/[.05] py-2.5 text-xs font-black text-white/65 hover:bg-white/[.09]"
          >
            Voir le classement <ArrowRight className="size-4" />
          </Link>
        </GamePanel>
        <GamePanel className="record-panel h-fit p-5">
          <p className="text-[10px] font-black tracking-[.16em] text-[#f4c25b] uppercase">Records personnels</p>
          <Record label="Plus gros gain" value={data.metrics.largestNetWin === null ? '—' : formatCoins(data.metrics.largestNetWin)} />
          <Record label="Plus haute cote gagnante" value={formatOdds(data.metrics.highestWinningOdds)} />
          <Record label="Plus longue série" value={`${data.streaks.longestWinning} V`} />
        </GamePanel>
      </div>
    </div>
  )
}

function getStreakLabel(data: OverviewData) {
  if (!data.streaks.current) return '—'
  const outcome = data.streaks.current.outcome === 'WON' ? 'victoires' : 'défaites'
  return `${data.streaks.current.length} ${outcome}`
}

function HudStat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <GamePanel className="flex min-h-24 items-center gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#5865f2]/12 text-[#9da5ff]">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-[10px] font-black text-white/35 uppercase">{label}</span>
        <strong className="mt-1 block text-sm sm:text-base">{value}</strong>
      </span>
    </GamePanel>
  )
}
function SectionTitle({ icon: Icon, title, link }: { icon: typeof Ticket; title: string; link: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-black">
        <Icon className="size-5 text-[#8993ff]" />
        {title}
      </h2>
      <Link to={link} className="text-xs font-black text-[#9ea6ff] hover:text-white">
        Tout voir
      </Link>
    </div>
  )
}
function RivalRow({ row, guildId }: { row: LeaderboardRow; guildId: string }) {
  return (
    <Link
      to={`/app/${guildId}/players/${row.discordId}`}
      className={`grid grid-cols-[32px_1fr_auto] items-center gap-2 rounded-md px-3 py-2.5 text-sm hover:bg-white/[.05] ${row.isViewer ? 'bg-[#5865f2]/10 ring-1 ring-[#5865f2]/25' : ''}`}
    >
      <strong className="text-[#f4c25b]">#{row.rank}</strong>
      <span className="truncate font-bold">{row.globalName ?? row.username ?? 'Joueur'}</span>
      <span className="text-xs text-white/50">{formatCoins(row.value ?? 0)}</span>
    </Link>
  )
}
function Record({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/[.07] pt-4">
      <span className="text-xs text-white/45">{label}</span>
      <strong className="text-sm text-[#ffe093]">{value}</strong>
    </div>
  )
}
