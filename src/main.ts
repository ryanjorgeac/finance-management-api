import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { GlobalExceptionsFilter } from './exceptions/global-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('Financial Management API')
    .setDescription('API for a personal financial management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = process.env.PORT ?? 3000;
  console.log(`Listening on port ${port}`);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(
    new HttpExceptionFilter(configService),
    new GlobalExceptionsFilter(httpAdapterHost),
  );

  await app.listen(port);
}

bootstrap();
