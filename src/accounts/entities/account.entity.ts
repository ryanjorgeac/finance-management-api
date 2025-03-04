import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Decimal } from '@prisma/client/runtime/library';

export class Account {
  id: string;
  name: string;
  type: string;
  balance: Decimal;
  userId: string;
  user?: User;
  transactions?: Transaction[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial);
  }

  calculateBalance(): Decimal {
    if (!this.transactions?.length) {
      return this.balance;
    }

    return this.transactions.reduce((balance, transaction) => {
      const amount = transaction.amount as unknown as Decimal;
      if (transaction.type === 'credit') {
        return Decimal.add(balance, amount);
      } else {
        return Decimal.sub(balance, amount);
      }
    }, new Decimal(0));
  }

  hasSufficientFunds(amount: number | Decimal): boolean {
    const amountDecimal =
      typeof amount === 'number' ? new Decimal(amount) : amount;
    return this.balance.greaterThanOrEqualTo(amountDecimal);
  }
}
