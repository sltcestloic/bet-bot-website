import { useSearchParams } from 'react-router-dom'

import { Select, type SelectOption } from '@/client/components/ui/select'
import type { GameSeason } from '@/client/features/game/types/game-types'

export function GameSeasonSelect({
  seasons,
  selected,
  allowAll = false,
}: {
  seasons: GameSeason[]
  selected: GameSeason | null
  allowAll?: boolean
}) {
  const [params, setParams] = useSearchParams()
  const options: SelectOption[] = [
    ...(allowAll ? [{ value: 'all', label: 'Toutes les saisons' }] : []),
    ...seasons.map(season => ({ value: String(season.id), label: `Saison ${season.number}${season.title ? ` · ${season.title}` : ''}` })),
  ]
  const value = getSelectedSeasonValue(selected, seasons, allowAll)
  return (
    <Select
      ariaLabel="Saison"
      value={value}
      options={options}
      onValueChange={next => {
        const copy = new URLSearchParams(params)
        copy.set('season', next)
        copy.delete('cursor')
        setParams(copy)
      }}
      className="h-10 min-w-44 border-white/10 bg-[#171a27] text-xs"
    />
  )
}

function getSelectedSeasonValue(selected: GameSeason | null, seasons: GameSeason[], allowAll: boolean) {
  if (selected) return String(selected.id)
  if (allowAll) return 'all'
  return String(seasons[0]?.id ?? '')
}

export function SegmentedFilter({
  name,
  options,
  fallback,
}: {
  name: string
  options: { value: string; label: string }[]
  fallback: string
}) {
  const [params, setParams] = useSearchParams()
  const selected = params.get(name) ?? fallback
  return (
    <div className="inline-flex rounded-lg border border-white/[.08] bg-black/20 p-1">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            const copy = new URLSearchParams(params)
            copy.set(name, option.value)
            copy.delete('cursor')
            setParams(copy)
          }}
          className={`rounded-md px-3 py-2 text-xs font-black transition ${selected === option.value ? 'bg-[#5865f2] text-white shadow-[0_5px_18px_rgba(88,101,242,.3)]' : 'text-white/45 hover:text-white/75'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
