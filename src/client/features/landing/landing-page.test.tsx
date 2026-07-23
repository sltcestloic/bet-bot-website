// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LandingPage } from '@/client/features/landing/landing-page'

describe('LandingPage', () => {
  it('directs every add-to-server action to the development page', () => {
    render(<LandingPage />)

    const addLinks = screen.getAllByRole('link', { name: /Ajouter Bet Bot à mon serveur/i })

    expect(addLinks).toHaveLength(2)
    addLinks.forEach(link => {
      expect(link.getAttribute('href')).toBe('/under-development')
    })
  })
})
