import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { TransactionType, CommitmentFrequency } from '@prisma/client';

export class Commitment {
  id: string;
  amount: bigint;
  type: TransactionType;
  description: string;
  date: Date | null;
  frequency: CommitmentFrequency;
  userId: string;
  user: User;
  categoryId: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Commitment>) {
    Object.assign(this, partial);

    if (partial.amount !== undefined) {
      this.amount = this.convertToBigInt(partial.amount);
    }
  }

  private convertToBigInt(value: any): bigint {
    if (value === null || value === undefined) return 0n;
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    if (typeof value === 'string') return BigInt(value);
    return BigInt(String(value));
  }
}
