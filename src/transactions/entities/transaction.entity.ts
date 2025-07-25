import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { TransactionType } from '@prisma/client';

export class Transaction {
  id: string;
  amount: number;
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

  getPrecisedAmount(): number {
    return this.amount / 100;
  }

  getBalanceImpact(): number {
    return this.type === TransactionType.INCOME ? this.amount : -this.amount;
  }

  isExpense(): boolean {
    return this.type === TransactionType.EXPENSE;
  }

  isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  formatAmount(currencySymbol = '$'): string {
    const amount = this.getPrecisedAmount();
    return `${this.isExpense() ? '-' : ''}${currencySymbol}${amount.toFixed(2)}`;
  }
}
