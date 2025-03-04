import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class IncomeExpenseRequestDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(PeriodType)
  periodType?: PeriodType = PeriodType.MONTHLY;
}

export class IncomeExpenseResponseDto {
  startDate: string;
  endDate: string;
  periodType: PeriodType;
  data: {
    period: string; // Could be date, week number, month, or year
    income: number;
    expenses: number;
    net: number;
  }[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number; // Percentage of income saved
  };

  constructor(partial: Partial<IncomeExpenseResponseDto>) {
    Object.assign(this, partial);
  }
}
