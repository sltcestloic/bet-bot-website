import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/client/app/app'
import '@/client/app/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
