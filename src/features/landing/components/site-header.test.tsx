// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteHeader } from './site-header'

describe('SiteHeader', () => {
  it('shows an unavailable-dashboard tooltip that follows the pointer', () => {
    render(<SiteHeader />)
    const button = screen.getByRole('button', { name: /Se connecter avec Discord/i })

    expect(button.className).toContain('cursor-not-allowed')
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.mouseEnter(button, { clientX: 80, clientY: 60 })
    fireEvent.mouseMove(button, { clientX: 120, clientY: 90 })

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip.textContent).toMatch(/tableau de bord n’est pas encore disponible/i)
    expect(tooltip.style.left).toBe('134px')
    expect(tooltip.style.top).toBe('104px')

    fireEvent.mouseLeave(button)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
