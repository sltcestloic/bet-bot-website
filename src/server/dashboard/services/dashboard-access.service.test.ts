import { ForbiddenException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'

import { DashboardAccessService } from '@/server/dashboard/services/dashboard-access.service'

describe('DashboardAccessService', () => {
  it('authorizes only current members of active guilds', async () => {
    const repository = { hasGuildAccess: vi.fn().mockResolvedValue(true) }
    const service = new DashboardAccessService(repository)

    await expect(service.assertGuildAccess('viewer', 'guild')).resolves.toBeUndefined()
    expect(repository.hasGuildAccess).toHaveBeenCalledWith('viewer', 'guild')
  })

  it('rejects inaccessible guilds', async () => {
    const service = new DashboardAccessService({ hasGuildAccess: vi.fn().mockResolvedValue(false) })

    await expect(service.assertGuildAccess('viewer', 'guild')).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('requires the viewer and target to currently share the guild', async () => {
    const repository = { hasGuildAccess: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false) }
    const service = new DashboardAccessService(repository)

    await expect(service.assertSharedGuild('viewer', 'target', 'guild')).rejects.toBeInstanceOf(ForbiddenException)
  })
})
