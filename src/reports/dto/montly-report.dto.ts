import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class MonthlyReportRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;
}

export class MonthlyReportResponseDto {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categories: {
    id: string;
    name: string;
    color: string;
    totalAmount: number;
    percentage: number;
  }[];
  dailyTransactions: {
    day: number;
    income: number;
    expenses: number;
  }[];

  constructor(partial: Partial<MonthlyReportResponseDto>) {
    Object.assign(this, partial);
  }
}
