// @vitest-environment jsdom

import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from './reveal'

let observerCallback: IntersectionObserverCallback
const observe = vi.fn()
const disconnect = vi.fn()

class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback
  }

  observe = observe
  disconnect = disconnect
  unobserve = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}

describe('Reveal', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('reveals its content when it enters the viewport', () => {
    const { container } = render(<Reveal><span>Contenu</span></Reveal>)
    const element = container.firstElementChild as HTMLElement

    expect(element.dataset.state).toBe('hidden')
    expect(observe).toHaveBeenCalledWith(element)

    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })

    expect(element.dataset.state).toBe('visible')
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('disconnects the observer when unmounted', () => {
    const { unmount } = render(<Reveal><span>Contenu</span></Reveal>)

    unmount()

    expect(disconnect).toHaveBeenCalledOnce()
  })
})
