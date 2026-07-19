import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DevelopmentPage } from '../features/bot-access/development-page'
import { LandingPage } from '../features/landing/landing-page'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/under-development',
    element: <DevelopmentPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
