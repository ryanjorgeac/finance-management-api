import { TransactionType } from '@prisma/client';

export interface TransactionSummary {
  amount: number;
  type: TransactionType;
  date: Date;
}

export enum TransactionTypes {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}
