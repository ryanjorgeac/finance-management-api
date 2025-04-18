import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Decimal } from '@prisma/client/runtime/library';

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
  budgetAmount: Decimal | null;
  userId: string;
  user: User;
  transactions: Transaction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }

  getTotalSpending(startDate?: Date, endDate?: Date): Decimal {
    if (!this.transactions?.length) {
      return new Decimal(0);
    }

    return this.transactions
      .filter((transaction) => {
        if (transaction.type !== TransactionTypes.EXPENSE) return false;

        if (startDate && transaction.date < startDate) return false;
        if (endDate && transaction.date > endDate) return false;

        return true;
      })
      .reduce((sum, transaction) => {
        return Decimal.add(sum, transaction.amount as unknown as Decimal);
      }, new Decimal(0));
  }

  getBudgetStatus(startDate?: Date, endDate?: Date): number | null {
    if (!this.budgetAmount) return null;

    const spent = this.getTotalSpending(startDate, endDate);
    return Number(Decimal.div(spent, this.budgetAmount).mul(100));
  }
}
