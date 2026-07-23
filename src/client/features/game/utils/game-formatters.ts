const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })

export const formatCoins = (value: number) => `${integer.format(value)} 🪙`
export const formatInteger = (value: number) => integer.format(value)
export const formatPercent = (value: number | null) => (value === null ? 'Indisponible' : percent.format(value))
export const formatOdds = (value: number | null) =>
  value === null ? 'Indisponible' : value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const formatGameDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(value))
