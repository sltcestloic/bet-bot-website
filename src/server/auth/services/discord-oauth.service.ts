import { BadGatewayException, Injectable } from '@nestjs/common'

import type { DiscordProfile } from '@/server/users/types/discord-profile'

export interface DiscordOAuthConfig {
  clientId: string
  clientSecret: string
  callbackUrl: string
}

type FetchImplementation = typeof fetch

@Injectable()
export class DiscordOAuthService {
  constructor(
    private readonly config: DiscordOAuthConfig,
    private readonly fetchImplementation: FetchImplementation = fetch,
  ) {}

  getAuthorizationUrl(state: string, callbackUrl = this.config.callbackUrl): string {
    const url = new URL('https://discord.com/oauth2/authorize')
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: callbackUrl,
      scope: 'identify',
      state,
    }).toString()
    return url.toString()
  }

  async getUserFromCode(code: string, callbackUrl = this.config.callbackUrl): Promise<DiscordProfile> {
    const tokenResponse = await this.fetchImplementation('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
      }),
    })

    if (!tokenResponse.ok) {
      throw new BadGatewayException('Discord token exchange failed')
    }

    const tokenPayload = (await tokenResponse.json()) as { access_token?: unknown }
    if (typeof tokenPayload.access_token !== 'string') {
      throw new BadGatewayException('Discord returned an invalid token response')
    }

    const profileResponse = await this.fetchImplementation('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
    })

    if (!profileResponse.ok) {
      throw new BadGatewayException('Discord profile request failed')
    }

    const profile = (await profileResponse.json()) as Record<string, unknown>
    if (typeof profile.id !== 'string' || typeof profile.username !== 'string') {
      throw new BadGatewayException('Discord returned an invalid user profile')
    }

    return {
      id: profile.id,
      username: profile.username,
      globalName: typeof profile.global_name === 'string' ? profile.global_name : null,
      avatarHash: typeof profile.avatar === 'string' ? profile.avatar : null,
      discriminator: typeof profile.discriminator === 'string' ? profile.discriminator : '0',
    }
  }
}
