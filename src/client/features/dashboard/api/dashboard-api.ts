import type { DashboardBootstrap } from '@/client/features/dashboard/types/dashboard-types'

export class DashboardUnauthorizedError extends Error {}
export class DashboardForbiddenError extends Error {}
export class DashboardRequestError extends Error {}

export async function dashboardRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    response = await fetch(`/api/dashboard${path}`, {
      ...options,
      credentials: 'same-origin',
      headers,
    })
  } catch {
    throw new DashboardRequestError()
  }
  if (response.status === 401) throw new DashboardUnauthorizedError()
  if (response.status === 403) throw new DashboardForbiddenError()
  if (!response.ok) throw new DashboardRequestError()
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getDashboardBootstrap() {
  return dashboardRequest<DashboardBootstrap>('/bootstrap')
}
