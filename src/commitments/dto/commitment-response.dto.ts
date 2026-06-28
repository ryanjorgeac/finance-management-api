import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, CommitmentFrequency } from '@prisma/client';
import { IsString } from 'class-validator';

export class CommitmentResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the commitment',
    example: '1234567890abcdef',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description:
      'Formatted commitment amount for display (input is sent as amountCents)',
    example: '1.500,00',
    type: 'string',
  })
  @IsString()
  @Expose()
  amount: string;

  @ApiProperty({
    description: 'Type of the commitment (INCOME or EXPENSE)',
    example: 'EXPENSE',
    enum: TransactionType,
  })
  @Expose()
  type: TransactionType;

  @ApiProperty({
    description: 'Description of the commitment',
    example: 'Monthly rent',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Next due date for the commitment',
    example: '2025-05-01T00:00:00Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Expose()
  date: Date | null;

  @ApiProperty({
    description: 'Recurrence frequency of the commitment',
    example: 'MONTHLY',
    enum: CommitmentFrequency,
  })
  @Expose()
  frequency: CommitmentFrequency;

  @ApiProperty({
    description: 'Unique identifier for the user who owns the commitment',
    example: '1234567890abcdef',
    format: 'uuid',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the category',
    example: '1234567890abcdef',
    format: 'uuid',
  })
  @Expose()
  categoryId: string;

  @ApiProperty({
    description: 'Indicates the date and time when the commitment was created',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description:
      'Indicates the date and time when the commitment was last updated',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<CommitmentResponseDto>) {
    Object.assign(this, partial);
  }
}
