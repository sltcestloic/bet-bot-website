import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

type ComposeConfig = {
  services: Record<string, {
    build: { context: string; dockerfile: string }
    ports: string[]
  }>
}

describe('production deployment', () => {
  it('builds the web image and exposes it only through localhost port 4201', () => {
    const composeFile = readFileSync(new URL('../../docker-compose.yml', import.meta.url), 'utf8')
    const config = parse(composeFile) as ComposeConfig
    const services = Object.values(config.services)

    expect(services).toHaveLength(1)
    expect(services[0].build).toEqual({ context: '.', dockerfile: 'Dockerfile' })
    expect(services[0].ports).toEqual(['127.0.0.1:4201:3000'])
  })
})
