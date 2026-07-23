import * as Popover from '@radix-ui/react-popover'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

export function DatePicker({
  ariaLabel,
  value,
  onValueChange,
  placeholder = 'Choisir une date',
}: {
  ariaLabel: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}) {
  const selected = value ? parseISO(value) : undefined
  return (
    <div className="relative flex min-w-0">
      <Popover.Root>
        <Popover.Trigger
          aria-label={ariaLabel}
          className="inline-flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-white/10 bg-[#20232d] px-3 pr-10 text-left text-sm font-semibold text-white transition outline-none hover:border-white/20 hover:bg-[#252935] focus-visible:border-[#6d79ff] focus-visible:ring-2 focus-visible:ring-[#5865f2]/25 data-[state=open]:border-[#6d79ff]"
        >
          <CalendarDays className="size-4 shrink-0 text-[#8f99ff]" aria-hidden="true" />
          <span className={`truncate ${selected ? '' : 'text-white/40'}`}>
            {selected ? format(selected, 'd MMM yyyy', { locale: fr }) : placeholder}
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            collisionPadding={12}
            className="date-picker-content z-[90] rounded-md border border-white/10 bg-[#20232d] p-3 text-white shadow-[0_18px_48px_rgba(0,0,0,.45)]"
          >
            <DayPicker
              mode="single"
              locale={fr}
              weekStartsOn={1}
              selected={selected}
              defaultMonth={selected}
              onSelect={date => {
                if (date) onValueChange(format(date, 'yyyy-MM-dd'))
              }}
              showOutsideDays
              classNames={{
                root: 'select-none',
                months: 'flex',
                month: 'space-y-3',
                month_caption: 'relative flex h-9 items-center justify-center',
                caption_label: 'text-sm font-black capitalize',
                nav: 'absolute inset-x-0 top-3 flex items-center justify-between px-3',
                button_previous:
                  'flex size-8 items-center justify-center rounded text-white/55 outline-none hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5865f2]/40',
                button_next:
                  'flex size-8 items-center justify-center rounded text-white/55 outline-none hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5865f2]/40',
                month_grid: 'border-collapse',
                weekdays: 'flex',
                weekday: 'w-9 py-1 text-center text-[11px] font-bold text-white/35',
                week: 'mt-1 flex',
                day: 'relative size-9 p-0 text-center text-sm',
                day_button:
                  'flex size-9 items-center justify-center rounded outline-none transition hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-[#5865f2]/45',
                selected: '[&>button]:bg-[#5865f2] [&>button]:font-black [&>button]:text-white [&>button]:hover:bg-[#6875f5]',
                today: '[&>button]:ring-1 [&>button]:ring-[#7e88ff]/70',
                outside: 'text-white/20',
                disabled: 'pointer-events-none opacity-25',
                hidden: 'invisible',
              }}
              components={{
                Chevron: CalendarChevron,
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {value && (
        <button
          type="button"
          onClick={() => {
            onValueChange('')
          }}
          aria-label={`Effacer la ${ariaLabel.toLocaleLowerCase('fr-FR')}`}
          className="absolute top-1 right-1 flex size-8 items-center justify-center rounded text-white/35 outline-none hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5865f2]/40"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

function CalendarChevron({ orientation }: { orientation?: 'up' | 'down' | 'left' | 'right' }) {
  if (orientation === 'left') return <ChevronLeft className="size-4" />
  if (orientation === 'right') return <ChevronRight className="size-4" />
  if (orientation === 'up') return <ChevronUp className="size-4" />
  return <ChevronDown className="size-4" />
}
