import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import {
  AuthenticationRequiredError,
  AuthServiceUnavailableError,
  getCurrentUser,
} from '@/client/features/auth/api/auth-api'
import type { PublicUser } from '@/client/features/auth/types/public-user'
import { normalizeReturnTo } from '@/client/features/auth/routing/return-to'

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
