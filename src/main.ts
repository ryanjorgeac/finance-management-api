import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { GlobalExceptionsFilter } from './exceptions/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');

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
