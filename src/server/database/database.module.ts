import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { createDatabaseOptions } from '@/server/database/database-options'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createDatabaseOptions(config.getOrThrow<string>('DATABASE_URL'), config.get<string>('DATABASE_SSL') === 'true'),
    }),
  ],
})
export class DatabaseModule {}
