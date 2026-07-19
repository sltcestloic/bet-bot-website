import { useEffect } from 'react'
import { initializeAos } from '../lib/aos'
import { AppRouter } from './router'

export function App() {
  useEffect(() => {
    initializeAos()
  }, [])

  return <AppRouter />
}
