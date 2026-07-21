import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class HealthService {
  constructor(private readonly database: DataSource) {}

  async check() {
    await this.database.query('SELECT 1')
    return { status: 'ok' }
  }
}
