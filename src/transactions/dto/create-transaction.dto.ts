import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDate,
  IsDecimal,
} from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsDecimal()
  amount: Decimal;

  @IsNotEmpty()
  @IsString()
  type: TransactionType;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
