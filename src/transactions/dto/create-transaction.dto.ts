import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsIn,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['debit', 'credit'])
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
