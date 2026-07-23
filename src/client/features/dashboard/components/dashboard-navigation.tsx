import { Link } from 'react-router-dom'

import logoImage from '@/client/assets/logo.png'

export function DashboardBrand({ compact = false, to = '/dashboard' }: { compact?: boolean; to?: string }) {
  return (
    <Link to={to} aria-label="Bet Bot" className={`flex items-center gap-3 ${compact ? '' : 'h-16 border-b border-white/[0.07] px-5'}`}>
      <img src={logoImage} alt="" className="size-8 object-contain" />
      <span className="font-black">Bet Bot</span>
    </Link>
  )
}

export function getGuildDestination(pathname: string, search: string, currentGuildId: string, nextGuildId: string) {
  const prefix = `/dashboard/${currentGuildId}/`
  const page = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : 'overview'
  return `/dashboard/${nextGuildId}/${page || 'overview'}${search}`
}
