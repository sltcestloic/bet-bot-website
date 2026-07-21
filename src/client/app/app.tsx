import { useEffect } from 'react'
import { initializeAos } from '@/client/lib/aos'
import { AppRouter } from '@/client/app/router'

export function App() {
  useEffect(() => {
    initializeAos()
  }, [])

  return <AppRouter />
}
