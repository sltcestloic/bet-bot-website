import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'

export interface SelectOption {
  value: string
  label: string
  leading?: ReactNode
  disabled?: boolean
}

export function Select({
  ariaLabel,
  value,
  onValueChange,
  options,
  className = '',
  placeholder,
}: {
  ariaLabel: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  className?: string
  placeholder?: string
}) {
  const selectedOption = options.find(option => option.value === value)
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={`group inline-flex h-10 min-w-0 items-center justify-between gap-2 rounded-md border border-white/10 bg-[#1a1d26] px-3 text-left text-sm font-bold text-white transition outline-none hover:border-white/20 hover:bg-[#20232d] focus-visible:border-[#6d79ff] focus-visible:ring-2 focus-visible:ring-[#5865f2]/25 data-[placeholder]:text-white/45 ${className}`}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {selectedOption && (
            <span className="flex min-w-0 items-center gap-2">
              {selectedOption.leading}
              <span className="truncate">{selectedOption.label}</span>
            </span>
          )}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 shrink-0 text-white/45 transition group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="select-content z-[90] max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-white/10 bg-[#20232d] text-white shadow-[0_18px_48px_rgba(0,0,0,.45)]"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center bg-[#20232d] text-white/55">
            <ChevronUp className="size-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {options.map(option => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex min-h-10 cursor-default items-center gap-2 rounded px-3 pr-9 text-sm font-semibold outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-[#5865f2]/18 data-[highlighted]:text-white"
              >
                {option.leading && <span className="flex shrink-0 items-center">{option.leading}</span>}
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3 inline-flex items-center text-[#9da5ff]">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center bg-[#20232d] text-white/55">
            <ChevronDown className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
