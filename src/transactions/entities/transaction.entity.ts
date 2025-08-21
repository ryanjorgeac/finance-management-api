import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { TransactionType } from '@prisma/client';

export class Transaction {
  id: string;
  amount: bigint;
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

    if (partial.amount !== undefined) {
      this.amount = this.convertToBigInt(partial.amount);
    }
  }

  private convertToBigInt(value: any): bigint {
    if (value === null || value === undefined) return 0n;
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    if (typeof value === 'string') return BigInt(value);
    return BigInt(String(value));
  }

  getPrecisedAmount(): number {
    return Number(this.amount) / 100;
  }

  getBalanceImpact(): bigint {
    return this.type === TransactionType.INCOME ? this.amount : -this.amount;
  }

  getBalanceImpactInDollars(): number {
    return Number(this.getBalanceImpact()) / 100;
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
