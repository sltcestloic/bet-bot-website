// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AuthSuccessPage } from '@/client/features/auth/components/auth-success-page'

describe('AuthSuccessPage', () => {
  it('shows the authenticated Discord identity', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/auth/success',
          loader: () => ({
            id: '123',
            username: 'betfan',
            displayName: 'Bet Fan',
            avatarUrl: 'https://cdn.discordapp.com/avatar.png',
          }),
          HydrateFallback: () => null,
          element: <AuthSuccessPage />,
        },
      ],
      { initialEntries: ['/auth/success'] },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: /connecté en tant que bet fan/i })).toBeTruthy()
    expect(screen.getByText('@betfan')).toBeTruthy()
    expect(screen.getByRole('button', { name: /se déconnecter/i })).toBeTruthy()
  })
})
