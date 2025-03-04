import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Decimal } from '@prisma/client/runtime/library';

export class Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  color?: string;
  icon?: string;
  budgetAmount?: Decimal;
  userId: string;
  user?: User;
  transactions?: Transaction[];
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
        if (transaction.type !== 'debit') return false;

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
