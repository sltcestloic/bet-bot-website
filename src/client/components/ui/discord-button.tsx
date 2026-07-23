import type { ReactNode } from 'react'

interface DiscordButtonProps {
  children: ReactNode
  secondary?: boolean
  href?: string
}

export function DiscordButton({ children, secondary = false, href = '/under-development' }: DiscordButtonProps) {
  return (
    <a
      href={href}
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9b1ff] ${
        secondary
          ? 'border border-white/20 bg-white/8 text-white hover:bg-white/14'
          : 'bg-[#5865f2] text-white shadow-[0_10px_35px_rgba(88,101,242,0.35)] hover:-translate-y-0.5 hover:bg-[#6875f5]'
      }`}
    >
      {children}
    </a>
  )
}
