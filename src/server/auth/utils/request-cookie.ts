import type { Request } from 'express'

export function getRequestCookie(request: Request, name: string): string | undefined {
  const cookies: unknown = request.cookies
  if (!cookies || typeof cookies !== 'object') return undefined

  const value = (cookies as Record<string, unknown>)[name]
  return typeof value === 'string' ? value : undefined
}
