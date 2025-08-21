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
  createdAt: Date;
  updatedAt: Date;
  spentAmount: bigint;
  incomeAmount: bigint;
  remainingAmount: bigint;
  transactionCount: number;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
    this.remainingAmount = this.getRemainingAmount();
  }

  getRemainingAmount(): bigint {
    return this.budgetAmount - this.spentAmount + this.incomeAmount;
  }
}
