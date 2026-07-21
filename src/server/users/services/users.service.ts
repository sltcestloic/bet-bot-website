import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '@/server/users/entities/user.entity'
import type { DiscordProfile } from '@/server/users/types/discord-profile'
import type { PublicUser } from '@/server/users/types/public-user'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async synchronizeDiscordProfile(profile: DiscordProfile): Promise<UserEntity> {
    const existing = await this.users.findOneBy({ id: profile.id })
    const user = existing ?? this.users.create({ id: profile.id })

    user.username = profile.username
    user.displayName = profile.globalName || profile.username
    user.avatarHash = profile.avatarHash
    user.discriminator = profile.discriminator

    return this.users.save(user)
  }

  toPublicUser(user: UserEntity): PublicUser {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: this.getAvatarUrl(user),
    }
  }

  private getAvatarUrl(user: UserEntity): string {
    if (user.avatarHash) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatarHash}.webp?size=128`
    }

    const defaultAvatarIndex = user.discriminator !== '0'
      ? Number(user.discriminator) % 5
      : Number((BigInt(user.id) >> 22n) % 6n)

    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
  }
}
