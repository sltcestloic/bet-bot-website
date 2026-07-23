const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })
const dateTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' })

export const formatInteger = (value: number) => integer.format(value)
export const formatCoins = (value: number) => `${integer.format(value)} 🪙`
export const formatPercent = (value: number | null) => (value === null ? 'Indisponible' : percent.format(value))
export const formatOdds = (value: number | null) =>
  value === null ? 'Indisponible' : value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const formatDateTime = (value: string) => dateTime.format(new Date(value))

export function formatRelativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'à l’instant'
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`
  return `il y a ${Math.floor(seconds / 3600)} h`
}
