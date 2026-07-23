import { Filter, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { DatePicker } from '@/client/components/ui/date-picker'
import { Select } from '@/client/components/ui/select'

const keys = ['from', 'to', 'kind', 'outcome', 'sport', 'competition', 'team', 'phase'] as const
type FilterKey = (typeof keys)[number]
type FilterDraft = Record<FilterKey, string>

export function DashboardFilters({ detailed = false }: { detailed?: boolean }) {
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState<FilterDraft>(() => Object.fromEntries(keys.map(key => [key, params.get(key) ?? ''])) as FilterDraft)
  const active = keys.filter(key => params.get(key)).length
  const update = (key: FilterKey, value: string) => {
    setDraft(current => ({ ...current, [key]: value }))
  }
  const apply = () => {
    const next = new URLSearchParams(params)
    keys.forEach(key => {
      if (draft[key]) next.set(key, draft[key])
      else next.delete(key)
    })
    next.delete('cursor')
    setParams(next)
  }
  const reset = () => {
    const next = new URLSearchParams(params)
    keys.forEach(key => {
      next.delete(key)
    })
    next.delete('cursor')
    setDraft(Object.fromEntries(keys.map(key => [key, ''])) as FilterDraft)
    setParams(next)
  }

  return (
    <details className="mt-4 rounded-md border border-white/[0.08] bg-[#151820] open:pb-4">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm font-bold">
        <Filter className="size-4 text-[#8f99ff]" />
        Filtres
        {active > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-[#5865f2] text-[10px]">{active}</span>}
      </summary>
      <div className="grid gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <FilterControls draft={draft} detailed={detailed} update={update} />
      </div>
      <div className="mt-4 flex justify-end gap-2 px-4">
        <button
          type="button"
          onClick={reset}
          className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-white/55 hover:text-white"
        >
          <RotateCcw className="size-4" />
          Réinitialiser
        </button>
        <button type="button" onClick={apply} className="h-10 rounded-md bg-[#5865f2] px-4 text-sm font-black hover:bg-[#6875f5]">
          Afficher les résultats
        </button>
      </div>
    </details>
  )
}

function FilterControls({
  draft,
  detailed,
  update,
}: {
  draft: FilterDraft
  detailed: boolean
  update: (key: FilterKey, value: string) => void
}) {
  const onChange = (key: FilterKey) => (value: string) => {
    update(key, value)
  }
  return (
    <>
      <DateField label="Du" ariaLabel="Date de début" value={draft.from} onChange={onChange('from')} />
      <DateField label="Au" ariaLabel="Date de fin" value={draft.to} onChange={onChange('to')} />
      <SelectField
        label="Type"
        value={draft.kind}
        onChange={onChange('kind')}
        options={[
          ['', 'Tous'],
          ['SINGLE', 'Simple'],
          ['PARLAY', 'Combiné'],
        ]}
      />
      {detailed && (
        <>
          <SelectField
            label="Résultat"
            value={draft.outcome}
            onChange={onChange('outcome')}
            options={[
              ['', 'Tous'],
              ['PENDING', 'En attente'],
              ['WON', 'Gagné'],
              ['LOST', 'Perdu'],
              ['CANCELLED', 'Annulé'],
            ]}
          />
          <SelectField
            label="Phase"
            value={draft.phase}
            onChange={onChange('phase')}
            options={[
              ['', 'Toutes'],
              ['PREMATCH', 'Avant-match'],
              ['LIVE', 'En direct'],
            ]}
          />
          <SelectField
            label="Sport"
            value={draft.sport}
            onChange={onChange('sport')}
            options={[
              ['', 'Tous'],
              ['Football', 'Football'],
              ['Basketball', 'Basketball'],
              ['CS2', 'Counter-Strike 2'],
              ['LoL', 'League of Legends'],
              ['Tennis', 'Tennis'],
            ]}
          />
          <FilterField label="Compétition" value={draft.competition} onChange={onChange('competition')} />
          <FilterField label="Équipe" value={draft.team} onChange={onChange('team')} />
        </>
      )}
    </>
  )
}

function FilterField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="text-xs font-bold text-[#858c9d]">
      {label}
      <input
        type={type}
        value={value}
        onChange={event => {
          onChange(event.target.value)
        }}
        className="mt-1 block h-10 w-full rounded-md border border-white/10 bg-[#20232d] px-3 text-sm text-white outline-none focus:border-[#6975ff]"
      />
    </label>
  )
}
function DateField({
  label,
  ariaLabel,
  value,
  onChange,
}: {
  label: string
  ariaLabel: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="text-xs font-bold text-[#858c9d]">
      <span>{label}</span>
      <div className="mt-1">
        <DatePicker ariaLabel={ariaLabel} value={value} onValueChange={onChange} />
      </div>
    </div>
  )
}
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[][]
}) {
  return (
    <div className="text-xs font-bold text-[#858c9d]">
      <span>{label}</span>
      <Select
        ariaLabel={label}
        value={value}
        onValueChange={onChange}
        options={options.map(([option, text]) => ({ value: option, label: text }))}
        className="mt-1 w-full bg-[#20232d]"
      />
    </div>
  )
}
