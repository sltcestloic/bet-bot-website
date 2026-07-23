import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'

import { LandingRoute } from '@/client/app/landing-route'
import { AuthLoadingPage } from '@/client/features/auth/components/auth-loading-page'
import { AuthRouteError } from '@/client/features/auth/components/auth-route-error'
import { AuthSuccessPage } from '@/client/features/auth/components/auth-success-page'
import { LoginPage } from '@/client/features/auth/components/login-page'
import { loginLoader, protectedRouteLoader } from '@/client/features/auth/routing/auth-loaders'
import { DevelopmentPage } from '@/client/features/bot-access/development-page'
import { DashboardRoot } from '@/client/features/dashboard/components/dashboard-root'
import { adminLoader } from '@/client/features/dashboard/routing/dashboard-loaders'
import { GameLobby } from '@/client/features/game/components/game-lobby'
import { GameRoot } from '@/client/features/game/components/game-root'
import { GameShell } from '@/client/features/game/components/game-shell'
import { gameIndexLoader, gameRootLoader, shouldRevalidateGameRoot } from '@/client/features/game/routing/game-loaders'
import { getLegacyGameDestination } from '@/client/features/game/routing/game-routes'

const router = createBrowserRouter([
  { path: '/', element: <LandingRoute /> },
  { path: '/under-development', element: <DevelopmentPage /> },
  { path: '/login', loader: loginLoader, element: <LoginPage />, errorElement: <AuthRouteError />, HydrateFallback: AuthLoadingPage },
  {
    path: '/auth/success',
    loader: async args => {
      const result = await protectedRouteLoader(args)
      return result instanceof Response ? result : redirect('/app')
    },
    element: <AuthSuccessPage />,
    errorElement: <AuthRouteError />,
    HydrateFallback: AuthLoadingPage,
  },
  {
    id: 'game',
    path: '/app',
    loader: gameRootLoader,
    shouldRevalidate: shouldRevalidateGameRoot,
    element: <GameRoot />,
    errorElement: <AuthRouteError />,
    HydrateFallback: AuthLoadingPage,
    children: [
      { index: true, loader: gameIndexLoader, element: <GameLobby /> },
      {
        path: ':guildId',
        element: <GameShell />,
        children: [
          { index: true, loader: ({ params }) => redirect(`/app/${params.guildId}/profile`) },
          { path: 'profile', lazy: async () => ({ Component: (await import('@/client/features/game/pages/profile-page')).ProfilePage }) },
          { path: 'season', lazy: async () => ({ Component: (await import('@/client/features/game/pages/season-page')).SeasonPage }) },
          { path: 'tickets', lazy: async () => ({ Component: (await import('@/client/features/game/pages/tickets-page')).TicketsPage }) },
          {
            path: 'leaderboard',
            lazy: async () => ({ Component: (await import('@/client/features/game/pages/leaderboard-page')).LeaderboardPage }),
          },
          { path: 'stats', lazy: async () => ({ Component: (await import('@/client/features/game/pages/stats-page')).StatsPage }) },
          {
            path: 'players/:discordId',
            lazy: async () => ({ Component: (await import('@/client/features/game/pages/player-profile-page')).PlayerProfilePage }),
          },
        ],
      },
    ],
  },
  {
    id: 'dashboard',
    path: '/dashboard',
    element: <DashboardRoot />,
    errorElement: <AuthRouteError />,
    HydrateFallback: AuthLoadingPage,
    children: [
      { index: true, loader: () => redirect('/app') },
      {
        path: 'admin',
        loader: adminLoader,
        lazy: async () => ({ Component: (await import('@/client/features/dashboard/pages/admin-page')).AdminPage }),
      },
      {
        path: '*',
        loader: ({ request }) => {
          const url = new URL(request.url)
          return redirect(getLegacyGameDestination(url.pathname + url.search))
        },
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
