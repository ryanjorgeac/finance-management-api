import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ExceptionResponseDto } from './exception-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    const exceptionResponse = exception.getResponse();
    let message: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      message =
        (exceptionResponse as { message?: string }).message ||
        exception.message;
    } else {
      message = exception.message;
    }

    const exceptionDto = new ExceptionResponseDto();
    exceptionDto.statusCode = status;
    exceptionDto.timestamp = new Date().toISOString();
    exceptionDto.path = request.url;
    exceptionDto.message = message;
    exceptionDto.stacktrace = !isProduction ? exception.stack : undefined;

    this.logger.error(
      `HttpException: ${exception.message}, status: ${status}`,
      !isProduction ? exception.stack : undefined,
    );

    response.status(status).json(exceptionDto);
  }
}
