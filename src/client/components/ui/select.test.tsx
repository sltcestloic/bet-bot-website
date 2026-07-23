// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Select } from '@/client/components/ui/select'

describe('Select', () => {
  it('opens its options and emits the selected value', () => {
    const onValueChange = vi.fn()
    render(
      <Select
        ariaLabel="Type de ticket"
        value="single"
        onValueChange={onValueChange}
        options={[
          { value: 'single', label: 'Simple' },
          { value: 'parlay', label: 'Combiné' },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Type de ticket' }))
    fireEvent.click(screen.getByRole('option', { name: 'Combiné' }))

    expect(onValueChange).toHaveBeenCalledWith('parlay')
  })
})
