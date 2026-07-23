import { BarChart3, ChevronDown, LogOut, Medal, Shield, Ticket, Trophy, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom'

import logo from '@/client/assets/logo.png'
import { Select, type SelectOption } from '@/client/components/ui/select'
import { useGameData } from '@/client/features/game/hooks/use-game-data'
import { getGameGuildDestination } from '@/client/features/game/routing/game-routes'
import type { GameGuild, GameRootData } from '@/client/features/game/types/game-types'
import { formatCoins } from '@/client/features/game/utils/game-formatters'
import { logout } from '@/client/lib/auth-api'

const navigation = [
  { path: 'profile', label: 'Mon profil', mobileLabel: 'Profil', icon: UserRound },
  { path: 'season', label: 'Ma saison', mobileLabel: 'Saison', icon: Trophy },
  { path: 'tickets', label: 'Mes tickets', mobileLabel: 'Tickets', icon: Ticket },
  { path: 'leaderboard', label: 'Classement', mobileLabel: 'Classement', icon: Medal },
  { path: 'stats', label: 'Statistiques', mobileLabel: 'Stats', icon: BarChart3 },
]

export function GameShell() {
  const { guildId = '' } = useParams()
  const root = useRouteLoaderData<GameRootData>('game')
  if (!root) throw new Error('Game route data is unavailable')
  const guild = root.bootstrap.guilds.find(entry => entry.id === guildId)
  const location = useLocation()
  const navigate = useNavigate()
  const hud = useGameData<{ account: { balance: number | null; activeStake: number } | null }>(`/guilds/${guildId}/hud`)
  useEffect(() => {
    localStorage.setItem('bet-bot:last-guild', guildId)
  }, [guildId])
  const changeGuild = (value: string) => {
    void navigate(getGameGuildDestination(location.pathname, location.search, guildId, value))
  }
  return (
    <>
      <header className="game-hud sticky top-0 z-40 border-b border-white/[.08] bg-[#0d1019]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-3 sm:px-5">
          <NavLink to="/app" className="flex shrink-0 items-center gap-2" aria-label="Bet Bot">
            <img src={logo} alt="" className="size-9 rounded-lg shadow-[0_0_22px_rgba(88,101,242,.3)]" />
            <strong className="hidden text-sm font-black sm:block">Bet Bot</strong>
          </NavLink>
          <GuildSelect guildId={guildId} guild={guild} guilds={root.bootstrap.guilds} onChange={changeGuild} />
          <nav className="mx-auto hidden h-full items-center gap-1 lg:flex" aria-label="Navigation du jeu">
            {navigation.map(item => (
              <DesktopLink key={item.path} {...item} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden rounded-lg border border-[#f4c25b]/20 bg-[#f4c25b]/8 px-2.5 py-1.5 text-right sm:block">
              <span className="block text-[9px] font-black text-[#f4c25b]/70 uppercase">Solde disponible</span>
              <strong className="text-sm text-[#ffe19a]" aria-label={`${hud.data?.account?.balance ?? 0} pièces`}>
                {hud.data?.account ? formatCoins(hud.data.account.balance ?? 0) : '—'}
              </strong>
            </div>
            <AccountMenu root={root} navigate={navigate} />
          </div>
        </div>
      </header>
      <Outlet />
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-[70px] grid-cols-5 border-t border-white/10 bg-[#0d1019]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Navigation mobile"
      >
        {navigation.map(item => (
          <MobileLink key={item.path} {...item} />
        ))}
      </nav>
    </>
  )
}

function GuildSelect({
  guildId,
  guild,
  guilds,
  onChange,
}: {
  guildId: string
  guild?: GameGuild
  guilds: GameGuild[]
  onChange: (id: string) => void
}) {
  const options: SelectOption[] = guilds.map(entry => ({ value: entry.id, label: entry.name, leading: <GuildIcon guild={entry} /> }))
  return (
    <Select
      ariaLabel="Serveur sélectionné"
      value={guildId}
      onValueChange={onChange}
      options={options}
      className="h-10 w-[min(38vw,190px)] border-white/10 bg-white/[.045] text-xs"
      placeholder={guild?.name ?? 'Serveur'}
    />
  )
}

export function GuildIcon({ guild, className = 'size-6' }: { guild: GameGuild; className?: string }) {
  if (guild.iconHash)
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.iconHash}.webp?size=128`}
        alt=""
        className={`${className} rounded-md object-cover`}
      />
    )
  const initials = guild.name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
  return (
    <span className={`flex ${className} items-center justify-center rounded-md bg-[#5865f2]/20 text-[10px] font-black text-[#bdc2ff]`}>
      {initials}
    </span>
  )
}

function DesktopLink({ path, label, icon: Icon }: (typeof navigation)[number]) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `relative flex h-full items-center gap-2 px-3 text-xs font-black transition ${isActive ? 'text-white' : 'text-white/48 hover:text-white/80'}`
      }
    >
      <Icon className="size-4" />
      {label}
      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#7d88ff] opacity-0 shadow-[0_0_12px_#5865f2] [[aria-current=page]_&]:opacity-100" />
    </NavLink>
  )
}

function MobileLink({ path, label, mobileLabel, icon: Icon }: (typeof navigation)[number]) {
  return (
    <NavLink
      to={path}
      aria-label={label}
      className={({ isActive }) =>
        `relative flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-black transition ${isActive ? 'text-[#aab0ff]' : 'text-white/40'}`
      }
    >
      <Icon className="size-5" />
      <span>{mobileLabel}</span>
    </NavLink>
  )
}

function AccountMenu({ root, navigate }: { root: GameRootData; navigate: ReturnType<typeof useNavigate> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('mousedown', close)
    }
  }, [])
  const signOut = async () => {
    await logout()
    void navigate('/', { replace: true })
  }
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(value => !value)
        }}
        className="flex max-w-[214px] items-center gap-2 rounded-full border border-white/10 bg-white/[.05] p-1.5 pr-2.5 transition hover:border-white/15 hover:bg-white/[.08] lg:px-2.5 lg:py-2"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu du compte de ${root.user.displayName}`}
      >
        <img src={root.user.avatarUrl} alt="" className="size-9 shrink-0 rounded-full bg-white/10" />
        <span className="hidden min-w-0 flex-1 text-left lg:block">
          <span title={root.user.displayName} className="block truncate text-xs font-black text-white/90">
            {root.user.displayName}
          </span>
          <span title={`@${root.user.username}`} className="mt-0.5 block truncate text-[10px] font-semibold text-white/40">
            @{root.user.username}
          </span>
        </span>
        <ChevronDown className={`size-3 shrink-0 text-white/50 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-12 right-0 w-max min-w-[190px] rounded-lg border border-white/10 bg-[#171a26] p-2 shadow-2xl"
        >
          {root.bootstrap.isAdmin && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void navigate('/dashboard/admin')
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-white/70 hover:bg-white/[.06]"
            >
              <Shield className="size-4" />
              Ouvrir l’administration
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void signOut()
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-white/70 hover:bg-white/[.06]"
          >
            <LogOut className="size-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
