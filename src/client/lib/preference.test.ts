import { describe, expect, it } from 'vitest'

import { getPreferenceProgress, hasEnoughPreferenceData } from '@/client/lib/preference'

describe('preference data threshold', () => {
  it.each([undefined, 0, 1, 2])('rejects a preference with %s selections', selections => {
    expect(hasEnoughPreferenceData(selections === undefined ? undefined : { selections })).toBe(false)
  })

  it('accepts a preference from three selections', () => {
    expect(hasEnoughPreferenceData({ selections: 3 })).toBe(true)
  })

  it('formats progress toward the threshold', () => {
    expect(getPreferenceProgress({ selections: 1 })).toBe('1/3 sélections')
    expect(getPreferenceProgress(undefined)).toBe('0/3 sélections')
  })
})
