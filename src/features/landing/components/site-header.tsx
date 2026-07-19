import { useState } from 'react'
import type { MouseEvent } from 'react'
import { FaDiscord } from 'react-icons/fa'
import logoImage from '../../../assets/logo.png'

export function SiteHeader() {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  const getTooltipPosition = (pointerX: number, pointerY: number) => ({
    x: pointerX + 254 > window.innerWidth ? Math.max(12, pointerX - 254) : pointerX + 14,
    y: pointerY + 68 > window.innerHeight ? Math.max(12, pointerY - 68) : pointerY + 14,
  })

  const updateTooltipPosition = (event: MouseEvent<HTMLButtonElement>) => {
    setTooltipPosition(getTooltipPosition(event.clientX, event.clientY))
  }

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <a href="#accueil" className="flex items-center gap-3" aria-label="Bet Bot, accueil">
          <img src={logoImage} alt="" className="size-10 object-contain" />
          <span className="text-lg font-extrabold text-white">Bet Bot</span>
        </a>
        <button
          type="button"
          aria-label="Se connecter avec Discord"
          aria-disabled="true"
          aria-describedby={isTooltipVisible ? 'dashboard-unavailable-tooltip' : undefined}
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-md border border-white/20 bg-[#171921]/75 px-4 text-sm font-bold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-[#232630]"
          onMouseEnter={(event) => {
            updateTooltipPosition(event)
            setIsTooltipVisible(true)
          }}
          onMouseMove={updateTooltipPosition}
          onMouseLeave={() => setIsTooltipVisible(false)}
          onFocus={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect()
            setTooltipPosition(getTooltipPosition(bounds.right, bounds.bottom))
            setIsTooltipVisible(true)
          }}
          onBlur={() => setIsTooltipVisible(false)}
        >
          <FaDiscord className="size-[18px]" aria-hidden="true" />
          <span className="hidden sm:inline">Se connecter avec Discord</span>
          <span className="sm:hidden">Connexion</span>
        </button>
        {isTooltipVisible && (
          <div
            id="dashboard-unavailable-tooltip"
            role="tooltip"
            className="pointer-events-none fixed z-50 max-w-[240px] rounded-md border border-white/15 bg-[#20232c] px-3 py-2 text-xs font-semibold leading-5 text-white shadow-2xl"
            style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
          >
            Le tableau de bord n’est pas encore disponible.
          </div>
        )}
      </div>
    </header>
  )
}
