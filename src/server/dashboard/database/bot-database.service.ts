import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool, type QueryResultRow, TypeOverrides } from 'pg'

const POSTGRES_TIMESTAMP_OID = 1114
const botDatabaseTypes = new TypeOverrides()
botDatabaseTypes.setTypeParser(POSTGRES_TIMESTAMP_OID, parseBotTimestamp)

export function parseBotTimestamp(value: string) {
  return new Date(`${value.replace(' ', 'T')}Z`)
}

@Injectable()
export class BotDatabaseService implements OnApplicationShutdown {
  private readonly pool: Pool

  constructor(config: ConfigService) {
    this.pool = new Pool({
      connectionString: config.getOrThrow<string>('BOT_DATABASE_URL'),
      types: botDatabaseTypes,
      application_name: 'bet_bot_website_dashboard',
      max: 8,
      statement_timeout: 5_000,
      idle_in_transaction_session_timeout: 5_000,
    })
  }

  async query<Row extends QueryResultRow>(text: string, values: unknown[] = []): Promise<Row[]> {
    const result = await this.pool.query<Row>(text, values)
    return result.rows
  }

  async onApplicationShutdown() {
    await this.pool.end()
  }
}
