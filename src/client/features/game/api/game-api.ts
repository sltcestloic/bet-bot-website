import type { GameBootstrap } from '@/client/features/game/types/game-types'

export class GameUnauthorizedError extends Error {}
export class GameForbiddenError extends Error {}
export class GameRequestError extends Error {}

export async function gameRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    response = await fetch(`/api/app${path}`, {
      ...options,
      credentials: 'same-origin',
      headers,
    })
  } catch {
    throw new GameRequestError()
  }
  if (response.status === 401) throw new GameUnauthorizedError()
  if (response.status === 403) throw new GameForbiddenError()
  if (!response.ok) throw new GameRequestError()
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getGameBootstrap() {
  return gameRequest<GameBootstrap>('/bootstrap')
}
