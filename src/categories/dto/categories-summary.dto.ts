import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { centsTodollars } from 'src/common/utils/money';

export class CategoriesSummaryDto {
  @ApiProperty({
    description: 'Total budget across all categories',
    example: 650.0,
  })
  @Transform(centsTodollars)
  @Expose()
  totalBudget: number;

  @ApiProperty({
    description: 'Total amount spent across all categories',
    example: 446.25,
  })
  @Transform(centsTodollars)
  @Expose()
  totalSpent: number;

  @ApiProperty({
    description: 'Remaining budget across all categories',
    example: 203.75,
  })
  @Transform(centsTodollars)
  @Expose()
  remainingBudget: number;

  constructor(partial: Partial<CategoriesSummaryDto>) {
    Object.assign(this, partial);
  }
}
