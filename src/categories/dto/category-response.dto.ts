import { Expose, Type } from 'class-transformer';

class CategoryBasicDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  parentId: string;

  @Expose()
  @Type(() => CategoryBasicDto)
  parent?: CategoryBasicDto;

  @Expose()
  color: string;

  @Expose()
  icon: string;

  @Expose()
  budgetAmount: number;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
