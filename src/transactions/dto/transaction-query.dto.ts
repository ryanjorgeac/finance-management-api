import {
  IsOptional,
  IsUUID,
  IsString,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export class TransactionQueryDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Type of the transaction (INCOME or EXPENSE)',
    example: 'INCOME',
    enum: TransactionType,
    enumName: 'TransactionType',
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({
    description: 'Start date for filtering transactions',
    example: '2025-04-21T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering transactions',
    example: '2025-04-21T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for filtering transactions',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Sorting order for the transactions (asc or desc)',
    enum: Order,
    enumName: 'Order',
    required: false,
  })
  @IsOptional()
  @IsEnum(Order)
  readonly order?: Order = Order.DESC;
}
