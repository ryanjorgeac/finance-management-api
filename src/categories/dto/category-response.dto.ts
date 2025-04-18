import { Decimal } from '@prisma/client/runtime/library';
import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose()
  color: string | null;

  @Expose()
  icon: string | null;

  @Expose()
  budgetAmount: Decimal | null;

  @Expose()
  userId: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
