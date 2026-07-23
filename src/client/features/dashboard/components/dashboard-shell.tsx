import { Activity, BarChart3, CircleDollarSign, History, LayoutDashboard, LogOut, Menu, Shield, Trophy, UsersRound, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom'

import { Select, type SelectOption } from '@/client/components/ui/select'
import { DashboardBrand, getGuildDestination } from '@/client/features/dashboard/components/dashboard-navigation'
import type { DashboardRootData } from '@/client/features/dashboard/types/dashboard-types'
import { logout } from '@/client/lib/auth-api'

const navigation = [
  { path: 'overview', label: 'Vue d’ensemble', mobileLabel: 'Accueil', icon: LayoutDashboard },
  { path: 'performance', label: 'Performances', mobileLabel: 'Stats', icon: BarChart3 },
  { path: 'sports', label: 'Sports et équipes', icon: UsersRound },
  { path: 'history', label: 'Historique', mobileLabel: 'Historique', icon: History },
  { path: 'economy', label: 'Économie', icon: CircleDollarSign },
  { path: 'leaderboards', label: 'Classements', mobileLabel: 'Classements', icon: Trophy },
  { path: 'activity', label: 'Activité', icon: Activity },
]

export function DashboardShell() {
  const { guildId = '' } = useParams()
  const root = useRouteLoaderData<DashboardRootData>('dashboard')
  if (!root) throw new Error('Dashboard route data is unavailable')
  const guild = root.bootstrap.guilds.find(entry => entry.id === guildId)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenu, setMobileMenu] = useState(false)
  const changeGuild = (value: string) => {
    void navigate(getGuildDestination(location.pathname, location.search, guildId, value))
  }
  const handleLogout = () => {
    void logout().then(() => navigate('/', { replace: true }))
  }

  return (
    <div className="min-h-svh bg-[#101218] text-[#f5f6f8]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-white/[0.07] bg-[#151820] lg:flex lg:flex-col">
        <DashboardBrand />
        <GuildSelect guildId={guildId} guildName={guild?.name} guilds={root.bootstrap.guilds} onChange={changeGuild} />
        <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Navigation principale">
          {navigation.map(item => (
            <NavigationLink key={item.path} {...item} />
          ))}
          {root.bootstrap.isAdmin && <NavigationLink path="/dashboard/admin" label="Administration" icon={Shield} absolute />}
        </nav>
        <UserMenu user={root.user} onLogout={handleLogout} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#151820]/95 px-4 backdrop-blur lg:hidden">
        <DashboardBrand compact />
        <button
          type="button"
          onClick={() => {
            setMobileMenu(true)
          }}
          className="flex size-10 items-center justify-center rounded-md border border-white/10"
          aria-label="Ouvrir la navigation"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {mobileMenu && (
        <MobileDashboardMenu
          guildId={guildId}
          guildName={guild?.name}
          root={root}
          changeGuild={changeGuild}
          close={() => {
            setMobileMenu(false)
          }}
          logout={handleLogout}
        />
      )}

      <main className="pb-20 lg:ml-[248px] lg:pb-0">
        <Outlet />
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-white/10 bg-[#151820]/98 px-1 lg:hidden"
        aria-label="Navigation mobile"
      >
        {navigation
          .filter(item => ['overview', 'performance', 'history', 'leaderboards'].includes(item.path))
          .map(item => (
            <MobileLink key={item.path} {...item} />
          ))}
        <button
          type="button"
          onClick={() => {
            setMobileMenu(true)
          }}
          className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold text-[#9298a8]"
        >
          <Menu className="size-5" />
          Plus
        </button>
      </nav>
    </div>
  )
}

function MobileDashboardMenu({
  guildId,
  guildName,
  root,
  changeGuild,
  close,
  logout: handleLogout,
}: {
  guildId: string
  guildName?: string
  root: DashboardRootData
  changeGuild: (value: string) => void
  close: () => void
  logout: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button type="button" className="absolute inset-0 bg-black/60" onClick={close} aria-label="Fermer la navigation" />
      <aside className="relative ml-auto flex h-full w-[min(88vw,340px)] flex-col bg-[#181b23] p-4">
        <div className="flex items-center justify-between">
          <DashboardBrand compact />
          <button type="button" onClick={close} className="flex size-10 items-center justify-center" aria-label="Fermer">
            <X />
          </button>
        </div>
        <GuildSelect
          guildId={guildId}
          guildName={guildName}
          guilds={root.bootstrap.guilds}
          onChange={value => {
            changeGuild(value)
            close()
          }}
        />
        <nav className="mt-5 space-y-1">
          {navigation.map(item => (
            <NavigationLink key={item.path} {...item} onNavigate={close} />
          ))}
          {root.bootstrap.isAdmin && (
            <NavigationLink path="/dashboard/admin" label="Administration" icon={Shield} absolute onNavigate={close} />
          )}
        </nav>
        <div className="mt-auto">
          <UserMenu user={root.user} onLogout={handleLogout} />
        </div>
      </aside>
    </div>
  )
}

function GuildSelect({
  guildId,
  guildName,
  guilds,
  onChange,
}: {
  guildId: string
  guildName?: string
  guilds: DashboardRootData['bootstrap']['guilds']
  onChange: (id: string) => void
}) {
  const options: SelectOption[] = guilds.map(guild => ({ value: guild.id, label: guild.name, leading: <GuildIcon guild={guild} /> }))
  if (!options.some(option => option.value === guildId)) options.unshift({ value: guildId, label: guildName ?? 'Serveur' })
  return (
    <div className="mx-3 mt-4">
      <Select
        ariaLabel="Serveur sélectionné"
        value={guildId}
        onValueChange={onChange}
        options={options}
        className="h-11 w-full bg-[#20232d]"
      />
    </div>
  )
}

function GuildIcon({ guild }: { guild: DashboardRootData['bootstrap']['guilds'][number] }) {
  if (guild.iconHash)
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.iconHash}.webp?size=64`}
        alt=""
        className="size-6 rounded object-cover"
      />
    )
  const initials = guild.name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
  return (
    <span className="flex size-6 items-center justify-center rounded bg-[#5865f2]/20 text-[10px] font-black text-[#b9bfff]">
      {initials}
    </span>
  )
}

function NavigationLink({
  path,
  label,
  icon: Icon,
  absolute = false,
  onNavigate,
}: {
  path: string
  label: string
  icon: typeof LayoutDashboard
  absolute?: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={absolute ? path : path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex h-11 items-center gap-3 rounded-md px-3 text-sm font-bold transition ${isActive ? 'bg-[#5865f2]/18 text-[#c5caff]' : 'text-[#9ba1b1] hover:bg-white/[0.05] hover:text-white'}`
      }
    >
      <Icon className="size-[18px]" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

function MobileLink({
  path,
  label,
  mobileLabel,
  icon: Icon,
}: {
  path: string
  label: string
  mobileLabel?: string
  icon: typeof LayoutDashboard
}) {
  return (
    <NavLink
      to={path}
      aria-label={label}
      className={({ isActive }) =>
        `flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive ? 'text-[#8f99ff]' : 'text-[#9298a8]'}`
      }
    >
      <Icon className="size-5" />
      <span>{mobileLabel ?? label}</span>
    </NavLink>
  )
}

function UserMenu({ user, onLogout }: { user: DashboardRootData['user']; onLogout: () => void }) {
  return (
    <div className="flex items-center gap-3 border-t border-white/[0.07] p-4">
      <img src={user.avatarUrl} alt="" className="size-9 rounded-full bg-[#252935]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{user.displayName}</p>
        <p className="truncate text-[11px] text-white/40">@{user.username}</p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex size-9 items-center justify-center rounded-md text-white/45 hover:bg-white/5 hover:text-white"
        title="Se déconnecter"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}
