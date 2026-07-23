import { ChevronDown, CircleAlert } from 'lucide-react'
import { useState } from 'react'

import type { Ticket } from '@/client/features/dashboard/types/dashboard-types'
import { formatCoins, formatDateTime, formatOdds } from '@/client/features/dashboard/utils/dashboard-formatters'

const outcomeLabels = { WON: 'Gagné', LOST: 'Perdu', PENDING: 'En attente', CANCELLED: 'Annulé' }
const outcomeClasses = {
  WON: 'bg-[#3aba85]/12 text-[#62d5a2]',
  LOST: 'bg-[#f07468]/12 text-[#f49a90]',
  PENDING: 'bg-[#f4c25b]/12 text-[#f4c25b]',
  CANCELLED: 'bg-white/7 text-white/55',
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="divide-y divide-white/[0.07]">
      {tickets.map(ticket => (
        <TicketRow key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <article className="py-4">
      <button
        type="button"
        onClick={() => {
          setExpanded(value => !value)
        }}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 text-left sm:grid-cols-[1.2fr_.7fr_.7fr_.7fr_auto]"
      >
        <span>
          <strong className="block text-sm">
            {ticket.kind === 'PARLAY' ? `Combiné · ${ticket.legs.length} sélections` : (ticket.legs[0]?.optionName ?? 'Ticket simple')}
          </strong>
          <span className="mt-1 block text-xs text-[#777f91]">{formatDateTime(ticket.placedAt)}</span>
        </span>
        <span className={`w-fit rounded px-2 py-1 text-[11px] font-black ${outcomeClasses[ticket.outcome]}`}>
          {outcomeLabels[ticket.outcome]}
        </span>
        <span className="hidden text-sm font-bold sm:block">{formatCoins(ticket.stake)}</span>
        <span className="hidden text-sm font-bold sm:block">{formatOdds(ticket.odds)}</span>
        <span className="flex items-center gap-2">
          {ticket.hasCorrection && <CircleAlert className="size-4 text-[#f4c25b]" aria-label="Résultat corrigé" />}
          <ChevronDown className={`size-4 text-white/40 transition ${expanded ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {expanded && (
        <div className="mt-4 space-y-2 border-l-2 border-[#5865f2]/35 pl-4">
          {ticket.legs.map(leg => (
            <div key={leg.id} className="grid gap-1 text-xs sm:grid-cols-[1fr_auto]">
              <p>
                <strong className="text-white/85">{leg.optionName}</strong> · {leg.team1} – {leg.team2}
              </p>
              <p className="text-[#8c93a4]">
                {leg.competition} · {formatOdds(leg.odds)} · {leg.placementPhase === 'LIVE' ? 'En direct' : 'Avant-match'}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
