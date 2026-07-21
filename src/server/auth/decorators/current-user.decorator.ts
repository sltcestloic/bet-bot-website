import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { AuthenticatedRequest } from '@/server/auth/types/authenticated-request'

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<AuthenticatedRequest>().authUser
})
