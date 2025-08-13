import { Prisma } from '@prisma/client';

export type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true };
}>;
