import { describe, expect, it, vi } from 'vitest'

import { createAdminLoader, createDashboardIndexLoader } from '@/client/features/dashboard/routing/dashboard-loaders'

describe('dashboard loaders', () => {
  it('redirects directly to the only accessible guild', async () => {
    const loader = createDashboardIndexLoader(
      vi.fn().mockResolvedValue({
        guilds: [{ id: 'guild-1', name: 'Guild', iconHash: null, memberCount: 2, lastSyncedAt: null }],
        isAdmin: false,
      }),
    )

    const response = await loader()

    expect(response).toBeInstanceOf(Response)
    expect((response as Response).headers.get('Location')).toBe('/dashboard/guild-1/overview')
  })

  it('keeps the selector when several guilds are accessible', async () => {
    const data = { guilds: [{ id: 'one' }, { id: 'two' }], isAdmin: false }
    const loader = createDashboardIndexLoader(vi.fn().mockResolvedValue(data) as never)

    await expect(loader()).resolves.toEqual(data)
  })
})

describe('admin loader', () => {
  it('silently redirects non-owners to the player app', async () => {
    const loader = createAdminLoader(vi.fn().mockResolvedValue({ guilds: [], isAdmin: false }))
    const response = await loader()
    expect(response).toBeInstanceOf(Response)
    expect((response as Response).headers.get('Location')).toBe('/app')
  })
})
