import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';

export class Transaction {
  id: string;
  amount: Decimal;
  type: TransactionType;
  description: string;
  date: Date;
  userId: string;
  user: User;
  categoryId: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }

  getBalanceImpact(): Decimal {
    return this.type === TransactionType.INCOME
      ? this.amount
      : Decimal.mul(this.amount, -1);
  }

  isExpense(): boolean {
    return this.type === TransactionType.EXPENSE;
  }

  isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  formatAmount(currencySymbol = '$'): string {
    return `${this.isExpense() ? '-' : ''}${currencySymbol}${this.amount.toString()}`;
  }
}
