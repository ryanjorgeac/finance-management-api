import { Expose, Transform, Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the transaction',
    example: '1234567890abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 100.5,
  })
  @Type(() => Decimal)
  @Transform(({ value }) => {
    if (!value) return null;
    return typeof value === 'object' && value.d ? Number(value.d[0]) : value;
  })
  @Expose()
  amount: Decimal;

  @ApiProperty({
    description: 'Type of the transaction (INCOME or EXPENSE)',
    example: 'INCOME',
  })
  @Expose()
  type: TransactionType;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Some description',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Date of the transaction',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  date: Date;

  @ApiProperty({
    description: 'Unique identifier for the user who created the transaction',
    example: '1234567890abcdef',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the category of the transaction',
    example: '1234567890abcdef',
  })
  @Expose()
  categoryId: string;

  @ApiProperty({
    description: 'Indicates the date and time when the transaction was created',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description:
      'Indicates the date and time when the transaction was last updated',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<TransactionResponseDto>) {
    Object.assign(this, partial);
  }
}
