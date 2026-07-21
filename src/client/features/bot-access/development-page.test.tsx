// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DevelopmentPage } from '@/client/features/bot-access/development-page'

describe('DevelopmentPage', () => {
  it('explains that Bet Bot is not publicly available yet', () => {
    render(<DevelopmentPage />)

    expect(screen.getByRole('heading', { name: /Bet Bot est en cours de développement/i })).toBeTruthy()
    expect(screen.getByText(/n’est pas encore disponible au public/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Retour à l’accueil/i }).getAttribute('href')).toBe('/')
  })
})
