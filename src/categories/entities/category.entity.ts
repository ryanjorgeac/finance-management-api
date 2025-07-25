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
    this.spentAmount = partial.spentAmount ?? 0;
    this.incomeAmount = partial.incomeAmount ?? 0;
    this.transactionCount = partial.transactionCount ?? 0;
    this.remainingAmount = this.getRemainingAmount();
  }

  getRemainingAmount(): number {
    return this.budgetAmount
      ? this.budgetAmount - this.spentAmount + this.incomeAmount
      : 0;
  }
}
