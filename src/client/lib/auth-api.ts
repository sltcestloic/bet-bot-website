import type { PublicUser } from '@/client/lib/public-user'

type FetchImplementation = typeof fetch

export class AuthenticationRequiredError extends Error {}
export class AuthServiceUnavailableError extends Error {}

export async function getCurrentUser(fetchImplementation: FetchImplementation = fetch): Promise<PublicUser> {
  let response: Response

  try {
    response = await fetchImplementation('/api/auth/me', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthServiceUnavailableError()
  }

  if (response.status === 401) throw new AuthenticationRequiredError()
  if (!response.ok) throw new AuthServiceUnavailableError()

  const user = (await response.json()) as Partial<PublicUser>
  if (
    typeof user.id !== 'string' ||
    typeof user.username !== 'string' ||
    typeof user.displayName !== 'string' ||
    typeof user.avatarUrl !== 'string'
  ) {
    throw new AuthServiceUnavailableError()
  }

  return user as PublicUser
}

export async function logout(fetchImplementation: FetchImplementation = fetch): Promise<void> {
  let response: Response

  try {
    response = await fetchImplementation('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthServiceUnavailableError()
  }

  if (!response.ok) throw new AuthServiceUnavailableError()
}
