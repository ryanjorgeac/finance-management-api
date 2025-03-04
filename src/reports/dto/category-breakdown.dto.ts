import { IsOptional, IsDateString } from 'class-validator';

export class CategoryBreakdownRequestDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CategoryBreakdownResponseDto {
  startDate: string;
  endDate: string;
  categories: {
    id: string;
    name: string;
    color: string;
    totalAmount: number;
    percentage: number;
    transactionCount: number;
  }[];

  constructor(partial: Partial<CategoryBreakdownResponseDto>) {
    Object.assign(this, partial);
  }
}
