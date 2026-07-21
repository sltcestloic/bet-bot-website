const DEFAULT_DESTINATION = '/auth/success'

export function normalizeReturnTo(destination: string | null | undefined): string {
  if (!destination || !destination.startsWith('/') || destination.startsWith('//')) {
    return DEFAULT_DESTINATION
  }

  if (destination.includes('\\') || /^\/login(?:[?#]|$)/.test(destination) || destination.startsWith('/api/auth')) {
    return DEFAULT_DESTINATION
  }

  try {
    const parsed = new URL(destination, 'https://betbot.local')
    return parsed.origin === 'https://betbot.local'
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : DEFAULT_DESTINATION
  } catch {
    return DEFAULT_DESTINATION
  }
}
