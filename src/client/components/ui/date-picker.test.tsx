// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DatePicker } from '@/client/components/ui/date-picker'

describe('DatePicker', () => {
  it('emits a calendar date in URL format', () => {
    const onValueChange = vi.fn()
    render(<DatePicker ariaLabel="Date de début" value="2026-07-21" onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Date de début' }))
    fireEvent.click(screen.getByRole('button', { name: /22 juillet 2026/i }))

    expect(onValueChange).toHaveBeenCalledWith('2026-07-22')
  })

  it('can clear the selected date', () => {
    const onValueChange = vi.fn()
    render(<DatePicker ariaLabel="Date de fin" value="2026-07-21" onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Effacer la date de fin' }))

    expect(onValueChange).toHaveBeenCalledWith('')
  })
})
