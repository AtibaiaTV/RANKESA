import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const origins = process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000']
  app.enableCors({ origin: origins, credentials: true })

  const config = new DocumentBuilder()
    .setTitle('RANK API')
    .setDescription('API para rankamento de jogadores esportivos — Jogue, Conecte, Evolua.')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.warn(`API running on http://localhost:${port}/v1`)
}

bootstrap()
