import { describe, expect, it } from 'vitest'

import { parseBotTimestamp } from '@/server/dashboard/database/bot-database.service'

describe('bot database timestamps', () => {
  it('interprets timestamp-without-time-zone values as UTC instants', () => {
    const timestamp = parseBotTimestamp('2026-07-22 16:56:05.060')

    expect(timestamp.toISOString()).toBe('2026-07-22T16:56:05.060Z')
    expect(
      new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: 'Europe/Paris',
      }).format(timestamp),
    ).toBe('18:56')
  })
})
