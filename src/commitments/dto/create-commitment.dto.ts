import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
  MaxLength,
  Max,
} from 'class-validator';
import { TransactionType, CommitmentFrequency } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommitmentDto {
  @ApiProperty({
    description: 'Amount of the commitment in cents',
    example: 150000,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(9999999999999)
  amountCents: number;

  @ApiProperty({
    description: 'Type of the commitment (INCOME or EXPENSE)',
    example: 'EXPENSE',
    enum: TransactionType,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Description of the commitment',
    example: 'Monthly rent',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  description: string;

  @ApiProperty({
    description: 'Next due date for the commitment',
    example: '2025-05-01T00:00:00Z',
    type: String,
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiProperty({
    description: 'Recurrence frequency of the commitment',
    example: 'MONTHLY',
    enum: CommitmentFrequency,
  })
  @IsNotEmpty()
  @IsEnum(CommitmentFrequency)
  frequency: CommitmentFrequency;

  @ApiProperty({
    description: 'Unique identifier for the category',
    example: '1234567890abcdef',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
