import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ApiReferenceModule } from '@scalar/nestjs-api-reference'
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
    .setTitle('Tennis Rank API')
    .setDescription('API para rankamento de jogadores de tênis')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  app.use('/docs', ApiReferenceModule.handler({ spec: { content: document } }))

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.warn(`API running on http://localhost:${port}/v1`)
}

bootstrap()
