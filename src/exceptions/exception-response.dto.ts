import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-04-21T12:34:56.789Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/path/to/resource',
  })
  path: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Error message describing the issue',
  })
  message: string;

  @ApiProperty({
    description: 'Error stack trace (only in non-production)',
    required: false,
    example:
      'Error: Error message describing the issue\n    at AuthService.create...',
  })
  stacktrace?: string;
}
