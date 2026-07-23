import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GameForbiddenError, gameRequest, GameUnauthorizedError } from '@/client/features/game/api/game-api'

export function useGameData<T>(path: string) {
  const navigate = useNavigate()
  const requestId = useRef(0)
  const [state, setState] = useState<{ data?: T; error?: boolean; loading: boolean }>({ loading: true })
  const load = useCallback(
    async (refresh = false) => {
      const currentRequestId = ++requestId.current
      setState(current => (refresh ? { ...current, loading: !current.data, error: false } : { loading: true }))
      try {
        const separator = path.includes('?') ? '&' : '?'
        const data = await gameRequest<T>(`${path}${refresh ? `${separator}refresh=true` : ''}`)
        if (currentRequestId !== requestId.current) return
        setState({ data, loading: false })
      } catch (error) {
        if (currentRequestId !== requestId.current) return
        if (error instanceof GameUnauthorizedError) {
          void navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
          return
        }
        if (error instanceof GameForbiddenError) {
          void navigate('/app', { replace: true })
          return
        }
        setState({ loading: false, error: true })
      }
    },
    [navigate, path],
  )
  useEffect(() => {
    void load()
    return () => {
      requestId.current += 1
    }
  }, [load])
  return {
    ...state,
    refresh: () => {
      void load(true)
    },
  }
}
