import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionType } from '@prisma/client';

enum TransactionTypes {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type TransactionSummary = {
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
  spentAmount: number;
  remainingAmount: number;
  transactionCount: number;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
    this.spentAmount = this.getTotalSpending();
    this.remainingAmount = this.getRemainingAmount();
    this.transactionCount = this.getTransactionCount();
  }

  getRemainingAmount(): number {
    console.log('[2] Calculating remaining budget for category:', this.name);
    console.log('Budget amount:', this.budgetAmount);
    console.log('Spent amount:', this.spentAmount);
    return this.budgetAmount ? this.budgetAmount + this.spentAmount : 0;
  }

  getTransactionCount(): number {
    console.log('[3] Calculating transaction count for category:', this.name);
    return this.transactions.length || 0;
  }

  getTotalSpending(startDate?: Date, endDate?: Date): number {
    console.log('[1] Calculating total spending for category:', this.name);
    console.log('Transactions:', this.transactions);
    if (!this.transactions?.length) {
      return 0;
    }

    return this.transactions
      .filter((transaction) => {
        if (startDate && transaction.date < startDate) return false;
        if (endDate && transaction.date > endDate) return false;
        return true;
      })
      .reduce((sum, transaction) => {
        const amount =
          transaction.type === TransactionTypes.INCOME
            ? transaction.amount
            : -transaction.amount;
        return sum + amount;
      }, 0);
  }
}
