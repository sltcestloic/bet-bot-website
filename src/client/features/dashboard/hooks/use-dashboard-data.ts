import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DashboardForbiddenError, dashboardRequest, DashboardUnauthorizedError } from '@/client/features/dashboard/api/dashboard-api'

export function useDashboardData<T>(path: string) {
  const navigate = useNavigate()
  const [state, setState] = useState<{ data?: T; error?: boolean; loading: boolean }>({ loading: true })

  const load = useCallback(
    async (refresh = false) => {
      setState(current => ({ ...current, loading: !current.data, error: false }))
      try {
        const separator = path.includes('?') ? '&' : '?'
        const data = await dashboardRequest<T>(`${path}${refresh ? `${separator}refresh=true` : ''}`)
        setState({ data, loading: false })
      } catch (error) {
        if (error instanceof DashboardUnauthorizedError) {
          void navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
          return
        }
        if (error instanceof DashboardForbiddenError) {
          void navigate('/dashboard', { replace: true })
          return
        }
        setState({ loading: false, error: true })
      }
    },
    [navigate, path],
  )

  useEffect(() => {
    void load()
  }, [load])
  return {
    ...state,
    refresh: () => {
      void load(true)
    },
  }
}
