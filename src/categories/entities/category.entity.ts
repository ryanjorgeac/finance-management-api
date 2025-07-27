import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionSummary } from 'src/common/types/transaction-summary';

export class Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  budgetAmount: number | null;
  userId: string;
  user: User;
  transactions: TransactionSummary[] | Transaction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  spentAmount: number;
  incomeAmount: number;
  remainingAmount: number;
  transactionCount: number;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);

    this.spentAmount = this.convertToNumber(partial.spentAmount) ?? 0;
    this.incomeAmount = this.convertToNumber(partial.incomeAmount) ?? 0;
    this.transactionCount = this.convertToNumber(partial.transactionCount) ?? 0;
    this.budgetAmount = this.convertToNumber(partial.budgetAmount) ?? null;

    this.remainingAmount = this.getRemainingAmount();
  }

  private convertToNumber(value: any): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return Number(value);
  }

  getRemainingAmount(): number {
    return this.budgetAmount
      ? this.budgetAmount - this.spentAmount + this.incomeAmount
      : 0;
  }
}
