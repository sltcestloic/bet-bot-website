import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthRouteError } from '@/client/features/auth/components/auth-route-error'
import { AuthLoadingPage } from '@/client/features/auth/components/auth-loading-page'
import { AuthSuccessPage } from '@/client/features/auth/components/auth-success-page'
import { LoginPage } from '@/client/features/auth/components/login-page'
import { loginLoader, protectedRouteLoader } from '@/client/features/auth/routing/auth-loaders'
import { DevelopmentPage } from '@/client/features/bot-access/development-page'
import { LandingPage } from '@/client/features/landing/landing-page'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/under-development',
    element: <DevelopmentPage />,
  },
  {
    path: '/login',
    loader: loginLoader,
    element: <LoginPage />,
    errorElement: <AuthRouteError />,
    HydrateFallback: AuthLoadingPage,
  },
  {
    path: '/auth/success',
    loader: protectedRouteLoader,
    element: <AuthSuccessPage />,
    errorElement: <AuthRouteError />,
    HydrateFallback: AuthLoadingPage,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
