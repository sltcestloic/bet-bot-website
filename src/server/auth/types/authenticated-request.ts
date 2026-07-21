import type { Request } from 'express'
import type { UserEntity } from '@/server/users/entities/user.entity'

export type AuthenticatedRequest = Request & {
  authUser: UserEntity
  authSessionToken: string
}
