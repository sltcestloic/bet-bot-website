import { ForbiddenException, Injectable } from '@nestjs/common'

export interface GuildAccessRepository {
  hasGuildAccess(discordId: string, guildId: string): Promise<boolean>
}

@Injectable()
export class DashboardAccessService {
  constructor(private readonly repository: GuildAccessRepository) {}

  async assertGuildAccess(discordId: string, guildId: string) {
    if (!(await this.repository.hasGuildAccess(discordId, guildId))) {
      throw new ForbiddenException()
    }
  }

  async assertSharedGuild(viewerDiscordId: string, targetDiscordId: string, guildId: string) {
    const [viewerHasAccess, targetHasAccess] = await Promise.all([
      this.repository.hasGuildAccess(viewerDiscordId, guildId),
      this.repository.hasGuildAccess(targetDiscordId, guildId),
    ])
    if (!viewerHasAccess || !targetHasAccess) throw new ForbiddenException()
  }
}
