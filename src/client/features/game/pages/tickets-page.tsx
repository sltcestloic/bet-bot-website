import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'

import { DatePicker } from '@/client/components/ui/date-picker'
import { Select } from '@/client/components/ui/select'
import { GameSeasonSelect, SegmentedFilter } from '@/client/features/game/components/game-filters'
import { GameTicketList } from '@/client/features/game/components/game-ticket-list'
import { GameEmpty, GameError, GameFrame, GameLoading, GamePageHeader } from '@/client/features/game/components/game-ui'
import { useGameData } from '@/client/features/game/hooks/use-game-data'
import type { GameSeason, GameTicket } from '@/client/features/game/types/game-types'

interface TicketData {
  season: GameSeason | null
  seasons: GameSeason[]
  tickets: GameTicket[]
  nextCursor: string | null
  filterOptions: { sports: string[]; competitions: string[]; teams: string[] }
}

export function TicketsPage() {
  const { guildId = '' } = useParams()
  const { search } = useLocation()
  const [sheet, setSheet] = useState(false)
  const state = useGameData<TicketData>(`/guilds/${guildId}/tickets${search || '?view=active'}`)
  if (state.loading)
    return (
      <GameFrame>
        <GameLoading />
      </GameFrame>
    )
  if (state.error || !state.data)
    return (
      <GameFrame>
        <GameError retry={state.refresh} />
      </GameFrame>
    )
  return (
    <GameFrame>
      <GamePageHeader eyebrow="Historique" title="Mes tickets" />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <SegmentedFilter
          name="view"
          fallback="active"
          options={[
            { value: 'active', label: 'En cours' },
            { value: 'settled', label: 'Terminés' },
            { value: 'all', label: 'Tous' },
          ]}
        />
        <div className="flex gap-2">
          <GameSeasonSelect seasons={state.data.seasons} selected={state.data.season} />
          <button
            type="button"
            onClick={() => {
              setSheet(true)
            }}
            className="game-icon-button"
            title="Filtres"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-6">
        {state.data.tickets.length ? (
          <GameTicketList tickets={state.data.tickets} />
        ) : (
          <GameEmpty title="Aucun ticket ici" description="Essayez une autre période ou placez votre prochaine prédiction sur Discord." />
        )}
      </div>
      {sheet && (
        <TicketFilterSheet
          options={state.data.filterOptions}
          onClose={() => {
            setSheet(false)
          }}
        />
      )}
    </GameFrame>
  )
}

function TicketFilterSheet({ options, onClose }: { options: TicketData['filterOptions']; onClose: () => void }) {
  const [params, setParams] = useSearchParams()
  const update = (key: string, value: string) => {
    const copy = new URLSearchParams(params)
    if (value) copy.set(key, value)
    else copy.delete(key)
    setParams(copy, { replace: true })
  }
  const selectOptions = (values: string[]) => [{ value: 'all', label: 'Tous' }, ...values.map(value => ({ value, label: value }))]
  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} aria-label="Fermer les filtres" />
      <aside
        className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-xl border-t border-white/10 bg-[#151824] p-5 pb-8 sm:inset-y-0 sm:left-auto sm:max-h-none sm:w-[380px] sm:rounded-none sm:border-l"
        aria-label="Filtres des tickets"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Filtres</h2>
          <button type="button" onClick={onClose} className="rounded-md bg-white/10 px-3 py-2 text-xs font-black">
            Fermer
          </button>
        </div>
        <div className="mt-6 space-y-5">
          <FilterSelect
            label="Type de ticket"
            name="kind"
            value={params.get('kind')}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'SINGLE', label: 'Simple' },
              { value: 'PARLAY', label: 'Combiné' },
            ]}
            update={update}
          />
          <FilterSelect label="Sport" name="sport" value={params.get('sport')} options={selectOptions(options.sports)} update={update} />
          <FilterSelect
            label="Compétition"
            name="competition"
            value={params.get('competition')}
            options={selectOptions(options.competitions)}
            update={update}
          />
          <FilterSelect label="Équipe" name="team" value={params.get('team')} options={selectOptions(options.teams)} update={update} />
          <FilterSelect
            label="Moment du jeu"
            name="phase"
            value={params.get('phase')}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'PREMATCH', label: 'Avant-match' },
              { value: 'LIVE', label: 'En direct' },
            ]}
            update={update}
          />
          <div className="block text-xs font-black text-white/55">
            <span>Depuis</span>
            <span className="mt-2 block">
              <DatePicker
                ariaLabel="Date de début"
                value={params.get('from') ?? ''}
                onValueChange={value => {
                  update('from', value)
                }}
              />
            </span>
          </div>
          <div className="block text-xs font-black text-white/55">
            <span>Jusqu’au</span>
            <span className="mt-2 block">
              <DatePicker
                ariaLabel="Date de fin"
                value={params.get('to') ?? ''}
                onValueChange={value => {
                  update('to', value)
                }}
              />
            </span>
          </div>
        </div>
      </aside>
    </div>
  )
}

function FilterSelect({
  label,
  name,
  value,
  options,
  update,
}: {
  label: string
  name: string
  value: string | null
  options: { value: string; label: string }[]
  update: (key: string, value: string) => void
}) {
  return (
    <label className="block text-xs font-black text-white/55">
      {label}
      <Select
        ariaLabel={label}
        value={value ?? 'all'}
        options={options}
        onValueChange={next => {
          update(name, next === 'all' ? '' : next)
        }}
        className="mt-2 w-full"
      />
    </label>
  )
}
