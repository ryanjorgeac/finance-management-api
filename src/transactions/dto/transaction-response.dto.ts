import { Expose, Type } from 'class-transformer';
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
