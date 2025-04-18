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

enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export class TransactionQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Order)
  readonly order?: Order = Order.DESC;
}
