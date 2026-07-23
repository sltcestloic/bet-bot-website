import { ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class AdminAccessService {
  constructor(private readonly ownerDiscordId: string) {}

  assertOwner(discordId: string) {
    if (discordId !== this.ownerDiscordId) throw new ForbiddenException()
  }

  isOwner(discordId: string) {
    return discordId === this.ownerDiscordId
  }
}
