import AOS from 'aos'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeAos } from './aos'

vi.mock('aos', () => ({
  default: {
    init: vi.fn(),
  },
}))

describe('initializeAos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('configures a short one-time entrance animation', () => {
    initializeAos()

    expect(AOS.init).toHaveBeenCalledWith(expect.objectContaining({
      duration: 500,
      easing: 'ease-out-cubic',
      offset: 60,
      once: true,
    }))
  })
})
