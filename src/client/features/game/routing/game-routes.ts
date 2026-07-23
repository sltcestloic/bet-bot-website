const legacySections: Record<string, string> = {
  overview: 'profile',
  history: 'tickets',
  leaderboards: 'leaderboard',
}

const statisticsTabs: Record<string, string> = {
  performance: 'performance',
  sports: 'affinities',
  economy: 'economy',
  activity: 'activity',
}

export function getLegacyGameDestination(value: string) {
  const url = new URL(value, 'https://bet-bot.local')
  const [, root, guildId, section, detail] = url.pathname.split('/')
  if (root !== 'dashboard' || !guildId) return '/app'
  if (section === 'players' && detail) return `/app/${guildId}/players/${detail}${url.search}`
  if (legacySections[section]) return `/app/${guildId}/${legacySections[section]}${url.search}`
  if (statisticsTabs[section]) {
    url.searchParams.set('tab', statisticsTabs[section])
    return `/app/${guildId}/stats${url.search}`
  }
  return `/app/${guildId}/profile${url.search}`
}

export function getGameGuildDestination(pathname: string, search: string, currentGuildId: string, nextGuildId: string) {
  const suffix = pathname.slice(`/app/${currentGuildId}`.length)
  if (suffix.startsWith('/players/')) return `/app/${nextGuildId}/profile`
  return `/app/${nextGuildId}${suffix || '/profile'}${search}`
}
