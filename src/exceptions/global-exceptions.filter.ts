import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExceptionResponseDto } from './exception-response.dto';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  constructor(private httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = 'Internal Server Error';

    this.logger.error(
      `Exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const exceptionDto = new ExceptionResponseDto();
    exceptionDto.statusCode = httpStatus;
    exceptionDto.timestamp = new Date().toISOString();
    exceptionDto.path = request.url;
    exceptionDto.message = message;

    httpAdapter.reply(response, exceptionDto, httpStatus);
  }
}
