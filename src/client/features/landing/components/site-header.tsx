import { FaDiscord } from 'react-icons/fa'

import logoImage from '@/client/assets/logo.png'
import type { LandingViewer } from '@/client/features/landing/landing-page'

export function SiteHeader({ viewer }: { viewer?: LandingViewer | null }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <a href="#home" className="flex items-center gap-3" aria-label="Bet Bot, accueil">
          <img src={logoImage} alt="" className="size-10 object-contain" />
          <span className="text-lg font-extrabold text-white">Bet Bot</span>
        </a>
        {viewer ? (
          <a
            href="/app"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-white/20 bg-[#171921]/75 px-3 text-sm font-bold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-[#232630]"
          >
            <img src={viewer.avatarUrl} alt="" className="size-6 rounded-full" />
            <span className="hidden max-w-36 truncate sm:inline">{viewer.displayName}</span>
            <span className="sm:hidden">Mon profil</span>
          </a>
        ) : (
          <a
            href="/login"
            aria-label="Se connecter avec Discord"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-white/20 bg-[#171921]/75 px-4 text-sm font-bold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-[#232630]"
          >
            <FaDiscord className="size-[18px]" aria-hidden="true" />
            <span className="hidden sm:inline">Se connecter avec Discord</span>
            <span className="sm:hidden">Connexion</span>
          </a>
        )}
      </div>
    </header>
  )
}
