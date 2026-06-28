import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class CategoriesSummaryDto {
  @ApiProperty({
    description: 'Total budget across all categories',
    example: '650,00',
  })
  @Expose()
  @IsString()
  totalBudget: string;

  @ApiProperty({
    description: 'Total amount spent across all categories',
    example: '446,25',
  })
  @Expose()
  @IsString()
  totalSpent: string;

  @ApiProperty({
    description: 'Remaining budget across all categories',
    example: '203,75',
  })
  @Expose()
  @IsString()
  remainingBudget: string;

  constructor(partial: Partial<CategoriesSummaryDto>) {
    Object.assign(this, partial);
  }
}
