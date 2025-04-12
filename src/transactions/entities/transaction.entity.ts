import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';

enum TransactionTypes {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class Transaction {
  id: string;
  amount: Decimal;
  type: TransactionType;
  description: string;
  date: Date;
  paymentMethod?: string;
  attachment?: string;
  userId: string;
  user?: User;
  categoryId: string;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }

  getBalanceImpact(): Decimal {
    return this.type === TransactionTypes.INCOME
      ? this.amount
      : Decimal.mul(this.amount, -1);
  }

  isExpense(): boolean {
    return this.type === TransactionTypes.EXPENSE;
  }

  isIncome(): boolean {
    return this.type === TransactionTypes.INCOME;
  }

  formatAmount(currencySymbol = '$'): string {
    return `${this.isExpense() ? '-' : ''}${currencySymbol}${this.amount.toString()}`;
  }
}
