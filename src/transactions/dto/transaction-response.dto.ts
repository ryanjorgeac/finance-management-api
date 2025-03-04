import { Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '../../accounts/dto/account-response.dto';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class TransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  amount: number;

  @Expose()
  type: string;

  @Expose()
  description: string;

  @Expose()
  date: Date;

  @Expose()
  paymentMethod: string;

  @Expose()
  attachment: string;

  @Expose()
  userId: string;

  @Expose()
  accountId: string;

  @Expose()
  @Type(() => AccountResponseDto)
  account?: AccountResponseDto;

  @Expose()
  categoryId: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  category?: CategoryResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<TransactionResponseDto>) {
    Object.assign(this, partial);
  }
}
