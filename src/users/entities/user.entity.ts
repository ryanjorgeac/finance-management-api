import { Category } from '../../categories/entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Exclude } from 'class-transformer';

export class User {
  id: string;
  email: string;

  @Exclude()
  password: string;

  firstName: string;
  lastName: string;
  role: string;
  transactions?: Transaction[];
  categories?: Category[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
