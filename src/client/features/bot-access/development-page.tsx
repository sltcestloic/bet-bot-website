import { ArrowLeft, CircleDot, Code2 } from 'lucide-react'
import logoImage from '@/client/assets/logo.png'

export function DevelopmentPage() {
  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-[#11131a] text-white">
      <div className="hero-grid absolute inset-0 -z-10 opacity-20" />
      <header className="mx-auto flex h-[76px] w-full max-w-[1180px] items-center px-5 sm:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Bet Bot, accueil">
          <img src={logoImage} alt="" className="size-10 object-contain" />
          <span className="text-lg font-extrabold">Bet Bot</span>
        </a>
      </header>

      <section className="mx-auto flex w-full max-w-[900px] flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-[#7d87f5]/25 bg-[#5865f2]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#b7bdff]">
          <CircleDot className="size-4" aria-hidden="true" />
          Développement actif
        </div>
        <span className="mb-7 flex size-16 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#9fa8ff] shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
          <Code2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="max-w-[780px] text-4xl font-black leading-[1.05] text-balance sm:text-6xl">
          Bet Bot est en cours de développement.
        </h1>
        <p className="mt-6 max-w-[650px] text-base leading-7 text-[#b9bdc9] sm:text-lg sm:leading-8">
          Le bot évolue encore activement et n’est pas encore disponible au public. Nous préparons une expérience fiable avant d’ouvrir les invitations aux serveurs Discord.
        </p>
        <a
          href="/"
          className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/10"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour à l’accueil
        </a>
      </section>

      <footer className="px-5 py-7 text-center text-xs text-white/35">
        Les invitations publiques ouvriront lorsque Bet Bot sera prêt.
      </footer>
    </main>
  )
}
