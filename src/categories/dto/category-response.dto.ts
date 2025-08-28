import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionSummary } from '../../common/types/transaction-summary';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the category',
    example: '1234567890abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Expenses related to groceries',
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Color associated with the category',
    example: '#FF5733',
  })
  @Expose()
  color: string | null;

  @ApiProperty({
    description: 'Icon associated with the category',
    example: 'tomato-icon',
  })
  @Expose()
  icon: string | null;

  @ApiProperty({
    description: 'Budget amount for the category',
    example: '500.00',
    type: 'string',
  })
  @IsString()
  @Expose()
  budgetAmount: string;

  @ApiProperty({
    description: 'Unique identifier for the user who created the transaction',
    example: '1234567890abcdef',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Indicates if the category is active or not',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Indicates the date and time when the category was created',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description:
      'Indicates the date and time when the category was last updated',
    example: '2025-04-21T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: 'Total amount spent in this category in dollars',
    example: '350.75',
    type: 'string',
  })
  @Expose()
  @IsString()
  spentAmount: string;

  @ApiProperty({
    description: 'Total income amount in this category in dollars',
    example: '50.00',
    type: 'string',
  })
  @Expose()
  @IsString()
  incomeAmount: string;

  @ApiProperty({
    description: 'Remaining budget amount for this category in dollars',
    example: '149.25',
    type: 'string',
  })
  @Expose()
  @IsString()
  remainingAmount: string;

  @ApiProperty({
    description: 'Total number of transactions in this category',
    example: 12,
  })
  @Expose()
  transactionCount: number;

  @Exclude()
  transactions: TransactionSummary[] | Transaction[];

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
