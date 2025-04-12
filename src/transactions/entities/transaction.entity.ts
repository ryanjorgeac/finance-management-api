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
    const amount = this.amount as unknown as Decimal;
    return this.type === 'credit' ? amount : Decimal.mul(amount, -1);
  }

  isExpense(): boolean {
    return this.type === 'debit';
  }

  isIncome(): boolean {
    return this.type === 'credit';
  }

  formatAmount(currencySymbol = '$'): string {
    return `${this.isExpense() ? '-' : ''}${currencySymbol}${this.amount.toString()}`;
  }
}
