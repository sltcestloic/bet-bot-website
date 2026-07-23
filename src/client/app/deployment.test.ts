import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

interface ComposeConfig {
  services: Record<
    string,
    {
      build: { context: string; dockerfile: string; target: string }
      ports?: string[]
      networks?: string[]
    }
  >
  networks: Record<string, { external?: boolean }>
}

describe('production deployment', () => {
  it('exposes only the client and connects the server to external PostgreSQL', () => {
    const composeFile = readFileSync(new URL('../../../docker-compose.yml', import.meta.url), 'utf8')
    const config = parse(composeFile) as ComposeConfig
    const client = config.services.client
    const server = config.services.server

    expect(Object.keys(config.services)).toEqual(['client', 'server'])
    expect(client.build.target).toBe('client')
    expect(client.ports).toEqual(['127.0.0.1:4201:3000'])
    expect(server.build.target).toBe('server')
    expect(server.ports).toBeUndefined()
    expect(server.networks).toContain('postgres')
    expect(config.networks.postgres).toEqual({ external: true })
  })

  it('keeps local environment secrets out of Docker build contexts', () => {
    const dockerIgnore = readFileSync(new URL('../../../.dockerignore', import.meta.url), 'utf8')

    expect(dockerIgnore).toContain('.env\n')
    expect(dockerIgnore).toContain('.env.*')
    expect(dockerIgnore).toContain('!.env.example')
  })
})
