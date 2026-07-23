import { type LoaderFunctionArgs, redirect } from 'react-router-dom'

import { normalizeReturnTo } from '@/client/features/auth/routing/return-to'
import { AuthenticationRequiredError, AuthServiceUnavailableError, getCurrentUser } from '@/client/lib/auth-api'
import type { PublicUser } from '@/client/lib/public-user'

type GetCurrentUser = () => Promise<PublicUser>

export function createProtectedRouteLoader(loadUser: GetCurrentUser = getCurrentUser) {
  return async ({ request }: LoaderFunctionArgs) => {
    try {
      return await loadUser()
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) {
        const requestedUrl = new URL(request.url)
        const returnTo = `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
        return redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      }

      if (error instanceof AuthServiceUnavailableError) {
        throw new Response('Authentication service unavailable', { status: 503 })
      }

      throw error
    }
  }
}

export function createLoginLoader(loadUser: GetCurrentUser = getCurrentUser) {
  return async ({ request }: LoaderFunctionArgs) => {
    try {
      await loadUser()
      const returnTo = normalizeReturnTo(new URL(request.url).searchParams.get('returnTo'))
      return redirect(returnTo)
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) return null
      if (error instanceof AuthServiceUnavailableError) {
        throw new Response('Authentication service unavailable', { status: 503 })
      }
      throw error
    }
  }
}

export const protectedRouteLoader = createProtectedRouteLoader()
export const loginLoader = createLoginLoader()
