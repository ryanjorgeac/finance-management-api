import { TransactionType } from '@prisma/client';

export type TransactionQueryCondition = {
  userId: string;
  categoryId?: string;
  type?: TransactionType;
  date?: {
    gte?: Date;
    lte?: Date;
  };
  description?: {
    contains: string;
    mode: 'insensitive';
  };
};
