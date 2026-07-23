import { ForbiddenException } from '@nestjs/common'
import { describe, expect, it } from 'vitest'

import { AdminAccessService } from '@/server/dashboard/services/admin-access.service'

describe('AdminAccessService', () => {
  it('allows only the configured Discord owner', () => {
    const service = new AdminAccessService('1010998423178203156')

    expect(() => {
      service.assertOwner('1010998423178203156')
    }).not.toThrow()
    expect(() => {
      service.assertOwner('42')
    }).toThrow(ForbiddenException)
  })
})
