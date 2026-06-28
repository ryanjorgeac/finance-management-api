import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionSummary } from 'src/common/types/transaction-summary';

export class Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  budgetAmount: bigint;
  userId: string;
  user: User;
  transactions: TransactionSummary[] | Transaction[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  spentAmount: bigint;
  incomeAmount: bigint;
  remainingAmount: bigint;
  transactionCount: number;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);

    this.budgetAmount = this.normalizeBigInt(this.budgetAmount || null);
    this.spentAmount = this.normalizeBigInt(this.spentAmount) || 0n;
    this.incomeAmount = this.normalizeBigInt(this.incomeAmount) || 0n;
    this.transactionCount = this.transactionCount || 0;

    this.remainingAmount = this.getRemainingAmount();
  }

  private normalizeBigInt(value: any): bigint {
    if (value === null || value === undefined) {
      return 0n;
    }
    if (typeof value === 'bigint') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'string') {
      return BigInt(value);
    }
    return 0n;
  }

  getRemainingAmount(): bigint {
    const budget = this.budgetAmount || 0n;
    const spent = this.spentAmount || 0n;
    const income = this.incomeAmount || 0n;
    return budget - spent + income;
  }
}
