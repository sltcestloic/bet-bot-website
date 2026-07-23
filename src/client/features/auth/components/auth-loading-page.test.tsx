// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthLoadingPage } from '@/client/features/auth/components/auth-loading-page'

describe('AuthLoadingPage', () => {
  it('announces that the session is being checked', () => {
    render(<AuthLoadingPage />)

    expect(screen.getByRole('status', { name: /vérification de la session/i })).toBeTruthy()
  })
})
