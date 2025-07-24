import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionType } from '@prisma/client';

enum TransactionTypes {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

type TransactionSummary = {
  amount: number;
  type: TransactionType;
  date: Date;
};

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
  spentAmount?: number;
  remainingAmount?: number;
  transactionCount?: number;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
    this.spentAmount = this.getTotalSpending();
    this.remainingAmount = this.getRemainingAmount();
    this.transactionCount = this.getTransactionCount();
  }

  getSpentAmount(): number {
    return this.getTotalSpending();
  }

  getRemainingAmount(): number {
    return this.budgetAmount ? this.budgetAmount - this.getSpentAmount() : 0;
  }

  getTransactionCount(): number {
    return this.transactions?.length || 0;
  }

  getPrecisedBudget(): number | null {
    return this.budgetAmount ? this.budgetAmount / 100 : null;
  }

  static numberToCents(dollars: number): number {
    return Math.round(dollars * 100);
  }

  getTotalSpending(startDate?: Date, endDate?: Date): number {
    if (!this.transactions?.length) {
      return 0;
    }

    return this.transactions
      .filter((transaction) => {
        if (transaction.type !== TransactionTypes.EXPENSE) return false;
        if (startDate && transaction.date < startDate) return false;
        if (endDate && transaction.date > endDate) return false;

        return true;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }
}
