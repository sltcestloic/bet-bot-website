import { ArrowRight, Bot, Clock3 } from 'lucide-react'
import { Link, useRouteLoaderData } from 'react-router-dom'

import logo from '@/client/assets/logo.png'
import { DiscordButton } from '@/client/components/ui/discord-button'
import { GuildIcon } from '@/client/features/game/components/game-shell'
import type { GameRootData } from '@/client/features/game/types/game-types'

export function GameLobby() {
  const root = useRouteLoaderData<GameRootData>('game')
  if (!root) throw new Error('Game route data is unavailable')
  const lastGuild = localStorage.getItem('bet-bot:last-guild')
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-14">
      <header className="flex items-center gap-3">
        <img src={logo} alt="" className="size-11 rounded-lg" />
        <div>
          <p className="font-black">Bet Bot</p>
          <p className="text-xs text-white/45">Arène communautaire</p>
        </div>
      </header>
      <div className="my-auto py-14">
        <p className="text-xs font-black tracking-[.18em] text-[#8b94ff] uppercase">Choisir une arène</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Où jouons-nous aujourd’hui ?</h1>
        <p className="mt-2 text-sm text-white/50">Retrouvez votre profil et vos résultats dans chaque serveur.</p>
        {root.bootstrap.guilds.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {root.bootstrap.guilds.map(guild => (
              <Link
                key={guild.id}
                to={`/app/${guild.id}/profile`}
                className={`game-panel group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-[#7d88ff]/45 ${guild.id === lastGuild ? 'ring-1 ring-[#7d88ff]/45' : ''}`}
              >
                <GuildIcon guild={guild} className="size-14" />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-lg">{guild.name}</strong>
                  <span className="mt-1 flex items-center gap-1 text-xs text-white/42">
                    {guild.id === lastGuild && (
                      <>
                        <Clock3 className="size-3" />
                        Dernière arène visitée
                      </>
                    )}
                  </span>
                </div>
                <ArrowRight className="size-5 text-white/35 transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="game-panel mt-8 p-8 text-center">
            <Bot className="mx-auto size-9 text-[#8d96ff]" />
            <h2 className="mt-4 text-lg font-black">Aucune arène disponible</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
              Utilisez Bet Bot dans un serveur Discord pour faire apparaître votre profil ici.
            </p>
            <div className="mt-6">
              <DiscordButton href="/under-development">Ajouter Bet Bot à mon serveur</DiscordButton>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
