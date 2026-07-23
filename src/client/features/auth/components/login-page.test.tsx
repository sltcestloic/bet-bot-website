// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LoginPage } from '@/client/features/auth/components/login-page'

describe('LoginPage', () => {
  it('starts Discord OAuth with the validated destination', () => {
    render(
      <MemoryRouter initialEntries={['/login?returnTo=%2Fauth%2Fsuccess']}>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /continuer avec discord/i }).getAttribute('href')).toBe(
      '/api/auth/discord?returnTo=%2Fauth%2Fsuccess',
    )
  })

  it('shows a retryable message after an OAuth failure', () => {
    render(
      <MemoryRouter initialEntries={['/login?error=oauth_failed']}>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/connexion avec discord a échoué/i)).toBeTruthy()
  })
})
