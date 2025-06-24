import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

enum TransactionTypes {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  budgetAmount: number | null;
  userId: string;
  user: User;
  transactions: Transaction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }

  getPrecisedBudget(): number | null {
    return this.budgetAmount ? this.budgetAmount / 100 : null;
  }

  static numberTocents(dollars: number): number {
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

  getBudgetStatus(startDate?: Date, endDate?: Date): number | null {
    if (!this.budgetAmount) return null;

    const spent = this.getTotalSpending(startDate, endDate);
    return (spent / this.budgetAmount) * 100;
  }
}
