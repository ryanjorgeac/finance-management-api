import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsDecimal,
} from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Unique identifier for the transaction',
    example: '1234567890abcdef',
  })
  @IsNotEmpty()
  @IsDecimal()
  amount: Decimal;

  @ApiProperty({
    description: 'Type of the transaction (INCOME or EXPENSE)',
    example: 'INCOME',
  })
  @IsNotEmpty()
  @IsString()
  type: TransactionType;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Some description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Date of the transaction',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Unique identifier for the user who created the transaction',
    example: '1234567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
