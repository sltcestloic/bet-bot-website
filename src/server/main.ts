import 'reflect-metadata'

import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { AppModule } from '@/server/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)

  app.set('trust proxy', 1)
  app.setGlobalPrefix('api')
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          imgSrc: ["'self'", 'data:', 'https://cdn.discordapp.com'],
        },
      },
    }),
  )
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.enableShutdownHooks()

  await app.listen(Number(config.getOrThrow<string>('SERVER_PORT')), '0.0.0.0')
}

void bootstrap()
