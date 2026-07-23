import { type LoaderFunctionArgs, redirect, type ShouldRevalidateFunctionArgs } from 'react-router-dom'

import { GameUnauthorizedError, getGameBootstrap } from '@/client/features/game/api/game-api'
import { AuthenticationRequiredError, getCurrentUser } from '@/client/lib/auth-api'

export async function gameRootLoader({ request }: LoaderFunctionArgs) {
  try {
    const [user, bootstrap] = await Promise.all([getCurrentUser(), getGameBootstrap()])
    return { user, bootstrap }
  } catch (error) {
    if (error instanceof GameUnauthorizedError || error instanceof AuthenticationRequiredError) {
      const url = new URL(request.url)
      return redirect(`/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`)
    }
    throw error
  }
}

export async function gameIndexLoader() {
  const bootstrap = await getGameBootstrap()
  if (bootstrap.guilds.length === 1) return redirect(`/app/${bootstrap.guilds[0].id}/profile`)
  return bootstrap
}

export function shouldRevalidateGameRoot({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) return false
  return defaultShouldRevalidate
}
