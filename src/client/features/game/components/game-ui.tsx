import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export function GameFrame({ children }: { children: ReactNode }) {
  return <main className="game-page-enter mx-auto w-full max-w-[1240px] px-4 pt-5 pb-28 sm:px-6 sm:pt-8 lg:pb-12">{children}</main>
}

export function GamePageHeader({ eyebrow, title, stale }: { eyebrow?: string; title: string; stale?: boolean }) {
  return (
    <header>
      {eyebrow && <p className="text-[11px] font-black tracking-[.16em] text-[#7f89ff] uppercase">{eyebrow}</p>}
      <h1 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h1>
      {stale && <p className="mt-2 text-xs font-bold text-[#f4c25b]">Les données affichées peuvent être anciennes.</p>}
    </header>
  )
}

export function GamePanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`game-panel ${className}`}>{children}</section>
}

export function GameLoading() {
  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Chargement">
      {[1, 2, 3, 4, 5, 6].map(item => (
        <span key={item} className="h-36 animate-pulse rounded-lg border border-white/[.06] bg-white/[.04]" />
      ))}
    </div>
  )
}

export function GameError({ retry }: { retry: () => void }) {
  return (
    <div className="mt-10 rounded-lg border border-[#f07468]/30 bg-[#f07468]/8 px-5 py-10 text-center">
      <AlertCircle className="mx-auto size-7 text-[#f49a90]" />
      <h2 className="mt-3 font-black">Erreur de chargement</h2>
      <p className="mt-1 text-sm text-white/50">Les données sont momentanément indisponibles.</p>
      <button type="button" onClick={retry} className="mt-5 rounded-md bg-white/10 px-4 py-2 text-sm font-black hover:bg-white/15">
        Réessayer
      </button>
    </div>
  )
}

export function GameEmpty({
  title = 'Aucune donnée sur cette période',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-black">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-white/50">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
