import { type LoaderFunctionArgs, redirect } from 'react-router-dom'

import { DashboardForbiddenError, DashboardUnauthorizedError, getDashboardBootstrap } from '@/client/features/dashboard/api/dashboard-api'
import type { DashboardBootstrap } from '@/client/features/dashboard/types/dashboard-types'
import { AuthenticationRequiredError, getCurrentUser } from '@/client/lib/auth-api'

type LoadBootstrap = () => Promise<DashboardBootstrap>

export function createDashboardIndexLoader(loadBootstrap: LoadBootstrap = getDashboardBootstrap) {
  return async () => {
    const bootstrap = await loadBootstrap()
    if (bootstrap.guilds.length === 1) return redirect(`/dashboard/${bootstrap.guilds[0].id}/overview`)
    return bootstrap
  }
}

export async function dashboardRootLoader({ request }: LoaderFunctionArgs) {
  try {
    const [user, bootstrap] = await Promise.all([getCurrentUser(), getDashboardBootstrap()])
    return { user, bootstrap }
  } catch (error) {
    if (error instanceof DashboardUnauthorizedError || error instanceof AuthenticationRequiredError) {
      const url = new URL(request.url)
      return redirect(`/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`)
    }
    throw error
  }
}

export function createAdminLoader(loadBootstrap: LoadBootstrap = getDashboardBootstrap) {
  return async () => {
    try {
      const bootstrap = await loadBootstrap()
      return bootstrap.isAdmin ? bootstrap : redirect('/app')
    } catch (error) {
      if (error instanceof DashboardForbiddenError) return redirect('/app')
      if (error instanceof DashboardUnauthorizedError) return redirect('/login?returnTo=%2Fdashboard%2Fadmin')
      throw error
    }
  }
}

export const dashboardIndexLoader = createDashboardIndexLoader()
export const adminLoader = createAdminLoader()
