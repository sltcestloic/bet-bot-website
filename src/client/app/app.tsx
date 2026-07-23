import { useEffect } from 'react'

import { AppRouter } from '@/client/app/router'
import { initializeAos } from '@/client/lib/aos'

export function App() {
  useEffect(() => {
    initializeAos()
  }, [])

  return <AppRouter />
}
