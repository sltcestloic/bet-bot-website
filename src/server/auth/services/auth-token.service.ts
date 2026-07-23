import { createHmac, randomBytes } from 'node:crypto'

import { Injectable } from '@nestjs/common'

type RandomBytes = (size: number) => Buffer

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly secret: string,
    private readonly generateRandomBytes: RandomBytes = randomBytes,
  ) {}

  issue() {
    const token = this.generateRandomBytes(32).toString('base64url')
    return { token, tokenHash: this.hash(token) }
  }

  hash(token: string): string {
    return createHmac('sha256', this.secret).update(token).digest('hex')
  }
}
