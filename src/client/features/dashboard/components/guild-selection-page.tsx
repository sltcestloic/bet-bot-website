import { ArrowRight, Server } from 'lucide-react'
import { Link, useLoaderData, useRouteLoaderData } from 'react-router-dom'

import logoImage from '@/client/assets/logo.png'
import type { DashboardBootstrap, DashboardRootData } from '@/client/features/dashboard/types/dashboard-types'

export function GuildSelectionPage() {
  const root = useRouteLoaderData<DashboardRootData>('dashboard')
  const data = useLoaderData<DashboardBootstrap>()
  if (!root) throw new Error('Dashboard route data is unavailable')

  return (
    <main className="min-h-svh bg-[#101218] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center gap-3">
          <Link to="/dashboard" aria-label="Bet Bot">
            <img src={logoImage} alt="" className="size-11 object-contain" />
          </Link>
          <div>
            <p className="text-sm font-bold text-white/45">Bet Bot</p>
            <h1 className="text-2xl font-black">Choisissez un serveur</h1>
          </div>
        </header>
        <p className="mt-8 text-sm text-[#aeb3c2]">Connecté en tant que {root.user.displayName}</p>
        {data.guilds.length === 0 ? (
          <section className="mt-8 border-y border-white/10 py-14 text-center">
            <Server className="mx-auto size-8 text-[#72798c]" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-black">Aucun serveur disponible</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9298a8]">
              Vous devez avoir utilisé Bet Bot dans un serveur actif pour accéder à ses données.
            </p>
            <a href="https://discord.com/app" className="mt-6 inline-flex h-11 items-center rounded-md bg-[#5865f2] px-5 text-sm font-bold">
              Ouvrir Discord
            </a>
          </section>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {data.guilds.map(guild => (
              <Link
                key={guild.id}
                to={`/dashboard/${guild.id}/overview`}
                className="group flex min-h-20 items-center gap-4 rounded-md border border-white/10 bg-[#181b23] p-4 transition hover:border-[#7a85ff]/50 hover:bg-[#1e222d]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#5865f2]/15 text-lg font-black text-[#aeb5ff]">
                  {guild.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{guild.name}</strong>
                  <span className="text-xs text-white/45">{guild.memberCount.toLocaleString('fr-FR')} membres</span>
                </span>
                <ArrowRight
                  className="size-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
