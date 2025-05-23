import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { Expose, Transform } from 'class-transformer';

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
    example: 500.0,
  })
  @Transform(({ value }) => {
    if (!value) return null;
    // Convert Decimal object to number
    return typeof value === 'object' && value.d ? Number(value.d[0]) : value;
  })
  @Expose()
  budgetAmount: Decimal | null;

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

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
