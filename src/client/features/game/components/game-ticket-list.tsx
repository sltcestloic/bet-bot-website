import { Check, ChevronDown, CircleAlert, Clock3, Layers3, X } from 'lucide-react'
import { useState } from 'react'

import type { GameTicket } from '@/client/features/game/types/game-types'
import { formatCoins, formatGameDate, formatOdds } from '@/client/features/game/utils/game-formatters'

const status = {
  WON: { label: 'Gagné', icon: Check, className: 'text-[#65dca7] bg-[#35c58a]/10 border-[#35c58a]/25' },
  LOST: { label: 'Perdu', icon: X, className: 'text-[#f49589] bg-[#f07468]/10 border-[#f07468]/25' },
  PENDING: { label: 'En cours', icon: Clock3, className: 'text-[#f8d47d] bg-[#f4c25b]/10 border-[#f4c25b]/25' },
  CANCELLED: { label: 'Annulé', icon: CircleAlert, className: 'text-white/55 bg-white/[.04] border-white/10' },
}

const legStatus = {
  WON: { label: 'Gagné', icon: Check, className: 'text-[#65dca7] bg-[#35c58a]/10 border-[#35c58a]/25' },
  LOST: { label: 'Perdu', icon: X, className: 'text-[#f49589] bg-[#f07468]/10 border-[#f07468]/25' },
  PENDING: { label: 'En attente', icon: Clock3, className: 'text-[#f8d47d] bg-[#f4c25b]/10 border-[#f4c25b]/25' },
  CANCELLED: { label: 'Annulée', icon: CircleAlert, className: 'text-white/55 bg-white/[.04] border-white/10' },
  UNEVALUATED: { label: 'Non évaluée', icon: CircleAlert, className: 'text-white/55 bg-white/[.04] border-white/10' },
}

export function GameTicketList({ tickets }: { tickets: GameTicket[] }) {
  return (
    <div className="space-y-3">
      {tickets.map(ticket => (
        <GameTicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}

function GameTicketCard({ ticket }: { ticket: GameTicket }) {
  const [expanded, setExpanded] = useState(false)
  const config = status[ticket.outcome]
  const StatusIcon = config.icon
  const first = ticket.legs[0]
  const summary = getTicketSummary(ticket)
  return (
    <article className="game-ticket overflow-hidden rounded-lg border border-white/[.08] bg-[#171a27]/90 transition hover:-translate-y-0.5 hover:border-white/[.15]">
      <button
        type="button"
        onClick={() => {
          setExpanded(value => !value)
        }}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-4 text-left sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto]"
      >
        <span className={`row-span-2 grid size-10 place-items-center rounded-lg border sm:row-span-1 ${config.className}`}>
          <StatusIcon className="size-5" />
        </span>
        <span className="min-w-0">
          <strong className="flex items-center gap-2 truncate text-sm">
            {ticket.kind === 'PARLAY' && <Layers3 className="size-4 text-[#9fa6ff]" />}
            {ticket.kind === 'PARLAY' ? `Combiné · ${ticket.legs.length} sélections` : (first?.optionName ?? 'Ticket simple')}
          </strong>
          <span className="mt-1 block truncate text-xs text-white/40">{summary}</span>
        </span>
        <span
          className="col-start-2 row-start-2 text-left sm:col-start-auto sm:row-start-auto sm:text-right"
          aria-label={`Mise ${ticket.stake} pièces`}
        >
          <span className="block text-[9px] font-black text-white/30 uppercase">Mise</span>
          <strong className="mt-0.5 block text-sm">{formatCoins(ticket.stake)}</strong>
        </span>
        <span className="col-start-3 row-start-2 rounded-md border border-[#7d88ff]/35 bg-[#5865f2]/14 px-2.5 py-2 text-xs font-black text-[#b8bdff] shadow-[inset_0_1px_rgba(255,255,255,.05)] sm:col-start-auto sm:row-start-auto">
          Cote {formatOdds(ticket.odds)}
        </span>
        <TicketStatus config={config} expanded={expanded} className="col-start-3 row-start-1 flex sm:col-start-auto sm:row-start-auto" />
      </button>
      {expanded && (
        <div className="border-t border-white/[.07] bg-black/10 p-4">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <span className="text-xs text-white/40">{formatGameDate(ticket.placedAt)}</span>
            <TicketAmounts ticket={ticket} />
          </div>
          <div className="space-y-2">
            {ticket.legs.map(leg =>
              ticket.kind === 'PARLAY' ? <ParlayLegResult key={leg.id} leg={leg} /> : <SingleLegResult key={leg.id} leg={leg} />,
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function getTicketSummary(ticket: GameTicket) {
  if (ticket.kind === 'SINGLE') {
    const first = ticket.legs[0]
    return first ? `${first.team1} · ${first.team2}` : formatGameDate(ticket.placedAt)
  }
  const selections = ticket.legs.slice(0, 2).map(leg => leg.optionName)
  const remaining = ticket.legs.length - selections.length
  if (remaining > 0) selections.push(`+${remaining}`)
  return selections.length ? selections.join(' · ') : formatGameDate(ticket.placedAt)
}

function TicketStatus({
  config,
  expanded,
  className,
}: {
  config: (typeof status)[keyof typeof status]
  expanded: boolean
  className: string
}) {
  return (
    <span className={`items-center gap-2 ${className}`}>
      <span className={`rounded-md border px-2 py-1 text-[10px] font-black ${config.className}`}>{config.label}</span>
      <ChevronDown className={`size-4 text-white/35 transition ${expanded ? 'rotate-180' : ''}`} />
    </span>
  )
}

function TicketAmounts({ ticket }: { ticket: GameTicket }) {
  const secondary = getSecondaryAmount(ticket)
  return (
    <div className="flex gap-5 text-right">
      <span>
        <span className="block text-[9px] font-black text-white/30 uppercase">Mise</span>
        <strong className="mt-1 block text-sm">{formatCoins(ticket.stake)}</strong>
      </span>
      {secondary && (
        <span>
          <span className="block text-[9px] font-black text-white/30 uppercase">{secondary.label}</span>
          <strong className="mt-1 block text-sm text-[#65dca7]">{formatCoins(secondary.value)}</strong>
        </span>
      )}
    </div>
  )
}

function getSecondaryAmount(ticket: GameTicket) {
  if (ticket.outcome === 'WON') return { label: 'Gain total', value: ticket.payout }
  if (ticket.outcome === 'CANCELLED' && ticket.payout > 0) return { label: 'Remboursé', value: ticket.payout }
  return null
}

function SingleLegResult({ leg }: { leg: GameTicket['legs'][number] }) {
  return (
    <article className="rounded-md border border-white/[.06] bg-white/[.035] p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-sm text-white/90">{leg.optionName}</strong>
        <SelectionOdds odds={leg.odds} />
        {leg.hasCorrection && <CorrectionBadge />}
      </div>
      <MatchScore leg={leg} />
      <p className="mt-1 text-white/38">
        {leg.competition} · {leg.placementPhase === 'LIVE' ? 'En direct' : 'Avant-match'}
      </p>
    </article>
  )
}

function ParlayLegResult({ leg }: { leg: GameTicket['legs'][number] }) {
  const result = legStatus[leg.outcome as keyof typeof legStatus] ?? legStatus.UNEVALUATED
  const ResultIcon = result.icon
  return (
    <article className="grid gap-3 rounded-md border border-white/[.06] bg-white/[.035] p-3 text-xs sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm text-white/90">{leg.optionName}</strong>
          <SelectionOdds odds={leg.odds} />
          {leg.hasCorrection && <CorrectionBadge />}
        </div>
        <MatchScore leg={leg} />
        <p className="mt-1 text-white/38">
          {leg.competition} · {leg.placementPhase === 'LIVE' ? 'En direct' : 'Avant-match'}
        </p>
      </div>
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] font-black ${result.className}`}>
        <ResultIcon className="size-3.5" />
        {result.label}
      </span>
    </article>
  )
}

function SelectionOdds({ odds }: { odds: number }) {
  return (
    <span
      aria-label={`Cote de la sélection ${formatOdds(odds)}`}
      className="rounded border border-[#7d88ff]/25 bg-[#5865f2]/10 px-1.5 py-1 text-[10px] font-black text-[#adb3ff]"
    >
      {formatOdds(odds)}
    </span>
  )
}

function MatchScore({ leg }: { leg: GameTicket['legs'][number] }) {
  const hasScore = leg.scoreTeam1 !== null && leg.scoreTeam2 !== null
  if (!hasScore) return <p className="mt-2 text-sm text-white/38">Score indisponible</p>
  return (
    <p aria-label={`${leg.team1} ${leg.scoreTeam1} – ${leg.scoreTeam2} ${leg.team2}`} className="mt-2 text-sm text-white/55">
      <span className={leg.optionName === leg.team1 ? 'font-black text-white' : ''}>{leg.team1}</span>{' '}
      <strong className="text-white/80">
        {leg.scoreTeam1} – {leg.scoreTeam2}
      </strong>{' '}
      <span className={leg.optionName === leg.team2 ? 'font-black text-white' : ''}>{leg.team2}</span>
    </p>
  )
}

function CorrectionBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-[#f4c25b]/10 px-1.5 py-1 text-[9px] font-black text-[#f8d47d]">
      <CircleAlert className="size-3" />
      Résultat corrigé
    </span>
  )
}
