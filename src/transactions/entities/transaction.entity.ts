import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';
import { Decimal } from '@prisma/client/runtime/library';

export class Transaction {
  id: string;
  amount: Decimal;
  type: string;
  description: string;
  date: Date;
  paymentMethod?: string;
  attachment?: string;
  userId: string;
  user?: User;
  accountId: string;
  account?: Account;
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
