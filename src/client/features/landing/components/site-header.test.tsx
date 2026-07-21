// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteHeader } from '@/client/features/landing/components/site-header'

describe('SiteHeader', () => {
  it('links the Discord login action to the login page', () => {
    render(<SiteHeader />)
    const loginLink = screen.getByRole('link', { name: /Se connecter avec Discord/i })

    expect(loginLink.getAttribute('href')).toBe('/login')
    expect(loginLink.className).not.toContain('cursor-not-allowed')
  })
})
