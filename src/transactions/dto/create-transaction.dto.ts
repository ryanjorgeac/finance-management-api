import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsInt,
  Min,
} from 'class-validator';
import { TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Amount of the transaction in cents',
    example: 1059,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  amountCents: number;

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
